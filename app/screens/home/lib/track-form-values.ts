import type { TrackMetadataFormValues } from '@/app/shared/interface'

const TRACK_METADATA_FIELDS: Array<keyof TrackMetadataFormValues['metadata']> = [
  'title',
  'artist',
  'album',
  'albumArtist',
  'genre',
  'year',
  'trackNumber',
  'totalTracks',
  'discNumber',
  'totalDiscs',
  'comment',
  'composer',
  'copyright',
  'bpm',
  'language',
]

export function areTrackFormValuesEqual(
  left: TrackMetadataFormValues | null,
  right: TrackMetadataFormValues | null
) {
  if (left === right) {
    return true
  }

  if (!left || !right) {
    return false
  }

  const hasDifferentMetadata = TRACK_METADATA_FIELDS.some(
    (field) => left.metadata[field] !== right.metadata[field]
  )

  if (hasDifferentMetadata) {
    return false
  }

  return (
    left.cover?.description === right.cover?.description &&
    left.cover?.mimeType === right.cover?.mimeType &&
    left.cover?.previewUrl === right.cover?.previewUrl &&
    left.cover?.file === right.cover?.file
  )
}
