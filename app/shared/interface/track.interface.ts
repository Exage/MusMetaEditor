export interface TrackMetadata {
  title: string
  artist: string
  album?: string
  albumArtist?: string
  genre?: string
  year?: number
  trackNumber?: number
  totalTracks?: number
  discNumber?: number
  totalDiscs?: number
  comment?: string
  composer?: string
  copyright?: string
  bpm?: number
  language?: string
}

export interface TrackCover {
  file?: File
  previewUrl?: string
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp'
  description?: string
}

export interface TrackMetadataFormValues {
  metadata: TrackMetadata
  cover?: TrackCover
}
