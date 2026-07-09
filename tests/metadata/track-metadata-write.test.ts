import test from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import NodeID3 from 'node-id3'
import { writeAudioMetadata } from '../../app/shared/utils/track-metadata-write.utils'

type EmbeddedId3Image = Exclude<NonNullable<NodeID3.Tags['image']>, string>

const createAudioPayload = (): Buffer =>
  Buffer.from([
    0xff, 0xfb, 0x90, 0x64, 0x00, 0x1f, 0xfc, 0x21, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb,
    0xcc, 0xdd, 0xee, 0xff,
  ])

const decodeSyncSafeInteger = (buffer: Buffer): number =>
  (buffer[0] << 21) | (buffer[1] << 14) | (buffer[2] << 7) | buffer[3]

const stripLeadingId3Tag = (buffer: Buffer): Buffer => {
  if (buffer.subarray(0, 3).toString('ascii') !== 'ID3') {
    return buffer
  }

  const tagSize = decodeSyncSafeInteger(buffer.subarray(6, 10))
  return buffer.subarray(10 + tagSize)
}

const collectId3FrameIds = (buffer: Buffer): string[] => {
  if (buffer.subarray(0, 3).toString('ascii') !== 'ID3') {
    return []
  }

  const frameIds: string[] = []
  const tagSize = decodeSyncSafeInteger(buffer.subarray(6, 10))
  const tagEnd = 10 + tagSize
  let cursor = 10

  while (cursor + 10 <= tagEnd && buffer[cursor] !== 0x00) {
    const frameId = buffer.subarray(cursor, cursor + 4).toString('ascii')
    const frameSize = buffer.readUInt32BE(cursor + 4)

    if (!/^[A-Z0-9]{4}$/.test(frameId) || frameSize <= 0) {
      break
    }

    frameIds.push(frameId)
    cursor += 10 + frameSize
  }

  return frameIds
}

const countFrames = (frameIds: string[], frameId: string): number =>
  frameIds.filter((currentFrameId) => currentFrameId === frameId).length

const isEmbeddedId3Image = (value: NodeID3.Tags['image']): value is EmbeddedId3Image =>
  typeof value === 'object' && value !== null && 'imageBuffer' in value

const createCoverBuffer = async (format: 'png' | 'webp'): Promise<Buffer> => {
  const pipeline = sharp({
    create: {
      width: 1200,
      height: 900,
      channels: 4,
      background: {
        r: 24,
        g: 133,
        b: 212,
        alpha: 0.45,
      },
    },
  }).composite([
    {
      input: await sharp({
        create: {
          width: 480,
          height: 480,
          channels: 4,
          background: {
            r: 244,
            g: 90,
            b: 42,
            alpha: 0.9,
          },
        },
      })
        .png()
        .toBuffer(),
      left: 360,
      top: 210,
    },
  ])

  return format === 'png' ? pipeline.png().toBuffer() : pipeline.webp().toBuffer()
}

const createAudioFile = (buffer: Buffer): File =>
  new File([new Uint8Array(buffer)], 'track.mp3', {
    type: 'audio/mpeg',
  })

const createTaggedSourceMp3 = async (): Promise<Buffer> => {
  const sourceWithMessyTags = NodeID3.write(
    {
      title: 'Source title',
      album: 'Source album',
      userDefinedText: [
        {
          description: 'major_brand',
          value: 'M4A ',
        },
        {
          description: 'compatible_brands',
          value: 'isommp42',
        },
      ],
      private: [
        {
          ownerIdentifier: 'com.apple.iTunes',
          data: 'private-tag',
        },
      ],
      image: {
        mime: 'image/png',
        type: {
          id: 4,
        },
        description: 'legacy cover',
        imageBuffer: await createCoverBuffer('png'),
      },
    },
    createAudioPayload()
  )

  assert.ok(Buffer.isBuffer(sourceWithMessyTags))
  return sourceWithMessyTags
}

test('rewrites MP3 metadata as clean ID3v2.3 and keeps audio bytes untouched', async () => {
  const sourceBuffer = await createTaggedSourceMp3()

  const result = await writeAudioMetadata(createAudioFile(sourceBuffer), {
    title: 'Telegram Ready',
    artist: 'Clean Artist',
    album: 'Clean Album',
    albumArtist: 'Clean Album Artist',
    trackNumber: 2,
    totalTracks: 9,
    year: 2026,
  })

  assert.equal(result.subarray(0, 3).toString('ascii'), 'ID3')
  assert.equal(result[3], 0x03)
  assert.equal(result[4], 0x00)
  assert.deepEqual(stripLeadingId3Tag(result), stripLeadingId3Tag(sourceBuffer))

  const frameIds = collectId3FrameIds(result)
  assert.equal(countFrames(frameIds, 'APIC'), 1)
  assert.equal(countFrames(frameIds, 'TXXX'), 0)
  assert.equal(countFrames(frameIds, 'PRIV'), 0)

  const parsed = NodeID3.read(result) as NodeID3.Tags & {
    raw?: Record<string, unknown>
  }

  assert.equal(parsed.title, 'Telegram Ready')
  assert.equal(parsed.artist, 'Clean Artist')
  assert.equal(parsed.album, 'Clean Album')
  assert.equal(parsed.performerInfo, 'Clean Album Artist')
  assert.equal(parsed.trackNumber, '2/9')
  assert.equal(parsed.year, '2026')
  assert.equal(parsed.raw?.TXXX, undefined)
  assert.equal(parsed.raw?.PRIV, undefined)
  assert.equal(parsed.raw?.TALB, 'Clean Album')
  assert.equal(parsed.raw?.TPE2, 'Clean Album Artist')
  assert.ok(isEmbeddedId3Image(parsed.image))
  assert.equal(parsed.image.mime, 'image/jpeg')
  assert.equal(parsed.image.type.id, 3)
  assert.equal(parsed.image.description ?? '', '')

  const metadata = await sharp(parsed.image.imageBuffer).metadata()

  assert.equal(metadata.format, 'jpeg')
  assert.equal(metadata.isProgressive, false)
  assert.ok((metadata.width ?? 0) <= 500)
  assert.ok((metadata.height ?? 0) <= 500)
})

test('replaces any existing artwork with a single normalized APIC front cover', async () => {
  const sourceBuffer = await createTaggedSourceMp3()
  const replacementCover = await createCoverBuffer('webp')

  const result = await writeAudioMetadata(
    createAudioFile(sourceBuffer),
    {
      title: 'Replaced Cover',
      artist: 'Cover Artist',
    },
    {
      file: new File([new Uint8Array(replacementCover)], 'cover.webp', {
        type: 'image/webp',
      }),
      description: 'Telegram cover',
    }
  )

  const frameIds = collectId3FrameIds(result)
  assert.equal(countFrames(frameIds, 'APIC'), 1)
  assert.equal(countFrames(frameIds, 'TXXX'), 0)

  const parsed = NodeID3.read(result) as NodeID3.Tags

  assert.ok(isEmbeddedId3Image(parsed.image))
  assert.equal(parsed.image.mime, 'image/jpeg')
  assert.equal(parsed.image.type.id, 3)
  assert.equal(parsed.image.description ?? '', '')

  const metadata = await sharp(parsed.image.imageBuffer).metadata()

  assert.equal(metadata.format, 'jpeg')
  assert.equal(metadata.isProgressive, false)
  assert.ok((metadata.width ?? 0) <= 500)
  assert.ok((metadata.height ?? 0) <= 500)
})
