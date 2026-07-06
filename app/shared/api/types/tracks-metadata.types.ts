import type { TrackMetadataFormValues } from '@/app/shared/interface'
import type { IDownloadedFile } from './file-download.types'

export type IReadTrackMetadataResponseData = TrackMetadataFormValues

export type IWriteTrackMetadataResponseData = IDownloadedFile

// --- Batch API types ---

export type IReadTrackMetadataBatchItem = {
  index: number
  fileName: string
  fileSize: number
  metadata: TrackMetadataFormValues['metadata']
  cover: TrackMetadataFormValues['cover']
}

export type IReadTrackMetadataBatchError = {
  index: number
  fileName?: string
  error: string
}

export type IReadTracksMetadataBatchResponseData = {
  tracks: IReadTrackMetadataBatchItem[]
  errors: IReadTrackMetadataBatchError[]
}

export type TTrackCoverMode = 'keep-per-track' | 'replace-all' | 'remove-all'

export type IWriteTrackMetadataBatchItem = {
  index: number
  metadata: TrackMetadataFormValues['metadata']
}
