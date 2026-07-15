export const TRACK_METADATA_FORM_FIELDS = [
  { field: 'title', label: 'Title' },
  { field: 'artist', label: 'Artist' },
  { field: 'album', label: 'Album Title' },
  { field: 'albumArtist', label: 'Album Artist' },
  { field: 'year', label: 'Year' },
] as const

export type TrackMetadataTextField = (typeof TRACK_METADATA_FORM_FIELDS)[number]['field']
