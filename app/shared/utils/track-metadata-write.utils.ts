import 'server-only'

import NodeID3 from 'node-id3'
import type { TrackMetadata } from '../interface'
import { getFileExtension } from './audio-file.utils'
import {
  normalizeCoverForMp3Embedding,
  type NormalizedEmbeddedCover,
} from './track-cover-normalize.utils'

type CoverInput = {
  file: File
  description?: string
}

type WriteAudioMetadataOptions = {
  removeCover?: boolean
}

type EmbeddedId3Image = Exclude<NonNullable<NodeID3.Tags['image']>, string>

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

const isEmbeddedId3Image = (value: NodeID3.Tags['image']): value is EmbeddedId3Image =>
  typeof value === 'object' && value !== null && 'imageBuffer' in value

const buildId3Tags = (
  metadata: Partial<TrackMetadata>,
  cover?: NormalizedEmbeddedCover
): NodeID3.Tags => {
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

  if (cover) {
    tags.image = {
      mime: cover.mime,
      type: {
        id: 3,
      },
      description: cover.description,
      imageBuffer: cover.imageBuffer,
    }
  }

  return tags
}

const resolveMp3Cover = async (
  sourceBuffer: Buffer,
  cover?: CoverInput,
  options?: WriteAudioMetadataOptions
): Promise<NormalizedEmbeddedCover | undefined> => {
  if (options?.removeCover) {
    return undefined
  }

  if (cover) {
    const uploadedCoverBuffer = Buffer.from(await cover.file.arrayBuffer())
    return normalizeCoverForMp3Embedding(uploadedCoverBuffer)
  }

  const existingTags = NodeID3.read(sourceBuffer) as NodeID3.Tags

  if (!isEmbeddedId3Image(existingTags.image)) {
    return undefined
  }

  const existingCoverBuffer = existingTags.image.imageBuffer

  if (!existingCoverBuffer) {
    return undefined
  }

  return normalizeCoverForMp3Embedding(Buffer.from(existingCoverBuffer))
}

const writeMp3Metadata = async (
  file: File,
  metadata: Partial<TrackMetadata>,
  cover?: CoverInput,
  options?: WriteAudioMetadataOptions
): Promise<Buffer> => {
  const sourceBuffer = Buffer.from(await file.arrayBuffer())
  const resolvedCover = await resolveMp3Cover(sourceBuffer, cover, options)
  const tags = buildId3Tags(metadata, resolvedCover)

  if (Object.keys(tags).length === 0) {
    const stripped = (
      NodeID3 as typeof NodeID3 & {
        removeTagsFromBuffer(buffer: Buffer): Buffer | false
      }
    ).removeTagsFromBuffer(sourceBuffer)

    if (!Buffer.isBuffer(stripped)) {
      throw new Error('Failed to strip audio metadata')
    }

    return stripped
  }

  const result = NodeID3.write(tags, sourceBuffer)

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
