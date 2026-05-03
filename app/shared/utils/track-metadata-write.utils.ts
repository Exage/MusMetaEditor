import NodeID3 from 'node-id3'
import { TrackMetadata } from '@/app/shared/interface'
import { getFileExtension } from './audio-file.utils'

type CoverInput = {
  file: File
  description?: string
}

type WriteAudioMetadataOptions = {
  removeCover?: boolean
}

const toStringValue = (value?: string | number): string | undefined => {
  if (value === undefined) {
    return undefined
  }

  const normalized = `${value}`.trim()
  return normalized === '' ? undefined : normalized
}

const buildTrackPosition = (number?: number, total?: number): string | undefined => {
  if (number === undefined && total === undefined) {
    return undefined
  }

  if (number !== undefined && total !== undefined) {
    return `${number}/${total}`
  }

  return number !== undefined ? `${number}` : `0/${total}`
}

const buildId3Tags = async (
  metadata: Partial<TrackMetadata>,
  cover?: CoverInput
): Promise<NodeID3.Tags> => {
  const tags: NodeID3.Tags = {}
  const assignIfDefined = <K extends keyof NodeID3.Tags>(
    key: K,
    value: NodeID3.Tags[K] | undefined
  ): void => {
    if (value !== undefined) {
      tags[key] = value
    }
  }

  assignIfDefined('title', toStringValue(metadata.title))
  assignIfDefined('artist', toStringValue(metadata.artist))
  assignIfDefined('album', toStringValue(metadata.album))
  assignIfDefined('performerInfo', toStringValue(metadata.albumArtist))
  assignIfDefined('genre', toStringValue(metadata.genre))
  assignIfDefined('year', metadata.year !== undefined ? `${metadata.year}` : undefined)
  assignIfDefined('trackNumber', buildTrackPosition(metadata.trackNumber, metadata.totalTracks))
  assignIfDefined('partOfSet', buildTrackPosition(metadata.discNumber, metadata.totalDiscs))
  assignIfDefined('composer', toStringValue(metadata.composer))
  assignIfDefined('copyright', toStringValue(metadata.copyright))
  assignIfDefined('bpm', metadata.bpm !== undefined ? `${metadata.bpm}` : undefined)
  assignIfDefined('language', toStringValue(metadata.language))

  const commentText = toStringValue(metadata.comment)
  assignIfDefined(
    'comment',
    commentText
      ? {
          language: 'eng',
          text: commentText,
        }
      : undefined
  )

  if (!cover) {
    return tags
  }

  const coverBuffer = Buffer.from(await cover.file.arrayBuffer())

  tags.image = {
    mime: cover.file.type || 'image/jpeg',
    type: {
      id: 3,
    },
    description: cover.description,
    imageBuffer: coverBuffer,
  }

  return tags
}

const writeMp3Metadata = async (
  file: File,
  metadata: Partial<TrackMetadata>,
  cover?: CoverInput,
  options?: WriteAudioMetadataOptions
): Promise<Buffer> => {
  const sourceBuffer = Buffer.from(await file.arrayBuffer())
  const tags = await buildId3Tags(metadata, cover)

  if (options?.removeCover) {
    const existingTags = NodeID3.read(sourceBuffer) as NodeID3.Tags
    delete existingTags.raw
    delete existingTags.image

    const nextTags: NodeID3.Tags = {
      ...existingTags,
      ...tags,
    }
    const rewritten = NodeID3.write(nextTags, sourceBuffer)

    if (rewritten instanceof Error || !Buffer.isBuffer(rewritten)) {
      throw new Error('Failed to remove cover from audio metadata')
    }

    return rewritten
  }

  const result = NodeID3.update(tags, sourceBuffer)

  if (result instanceof Error || !Buffer.isBuffer(result)) {
    throw new Error('Failed to write audio metadata')
  }

  return result
}

type AudioMetadataWriter = (
  file: File,
  metadata: Partial<TrackMetadata>,
  cover?: CoverInput,
  options?: WriteAudioMetadataOptions
) => Promise<Buffer>

const METADATA_WRITERS: Record<string, AudioMetadataWriter> = {
  mp3: writeMp3Metadata,
}

export const writeAudioMetadata = async (
  file: File,
  metadata: Partial<TrackMetadata>,
  cover?: CoverInput,
  options?: WriteAudioMetadataOptions
): Promise<Buffer> => {
  const extension = getFileExtension(file.name)
  const writer = METADATA_WRITERS[extension]

  if (!writer) {
    throw new Error(`Metadata writer for ".${extension}" is not implemented`)
  }

  return writer(file, metadata, cover, options)
}
