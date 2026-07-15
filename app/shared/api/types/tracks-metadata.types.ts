import type { TrackMetadataFormValues } from '@/app/shared/interface'
import type { IDownloadedFile } from './file-download.types'

export type IReadTrackMetadataResponseData = TrackMetadataFormValues

export type IWriteTrackMetadataResponseData = IDownloadedFile

export type IReadTrackMetadataItem = {
  index: number
  fileName: string
  fileSize: number
  metadata: TrackMetadataFormValues['metadata']
  cover: TrackMetadataFormValues['cover']
}

export type IReadTrackMetadataError = {
  index: number
  fileName?: string
  error: string
}

export type IReadTracksMetadataResponseData = {
  tracks: IReadTrackMetadataItem[]
  errors: IReadTrackMetadataError[]
}

export type TTrackCoverMode = 'keep-per-track' | 'replace-all' | 'remove-all'

export type IWriteTrackMetadataItem = {
  index: number
  metadata: TrackMetadataFormValues['metadata']
}
