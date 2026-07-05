import { API_ROUTES } from '@/app/shared/constants'
import { TrackMetadataFormValues } from '@/app/shared/interface'
import { ApiRequestOptions, DownloadedFile } from './api.types'
import { requestBlob, requestJson } from './api-client'

const createTrackRequestOptions = (
  formData: FormData,
  options?: ApiRequestOptions
): ApiRequestOptions => ({
  ...options,
  method: 'POST',
  body: formData,
})

export function readTrackMetadata(
  formData: FormData,
  options?: ApiRequestOptions
): Promise<TrackMetadataFormValues> {
  return requestJson<TrackMetadataFormValues>(
    API_ROUTES.READ_TRACK_METADATA,
    createTrackRequestOptions(formData, options)
  )
}

export function writeTrackMetadata(
  formData: FormData,
  options?: ApiRequestOptions
): Promise<DownloadedFile> {
  return requestBlob(API_ROUTES.WRITE_TRACK_METADATA, createTrackRequestOptions(formData, options))
}
