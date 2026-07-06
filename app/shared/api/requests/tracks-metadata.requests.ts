import { API_ROUTES } from '@/app/shared/constants'
import type { TrackMetadataFormValues } from '@/app/shared/interface'
import {
  parseApiJsonResponse,
  parseFileNameFromContentDisposition,
  throwResponseError,
} from '@/app/shared/api/lib'
import type { IDownloadedFile } from '@/app/shared/api/types'

export async function readTrackMetadata(formData: FormData): Promise<TrackMetadataFormValues> {
  const response = await fetch(API_ROUTES.READ_TRACK_METADATA, {
    method: 'POST',
    body: formData,
  })

  return parseApiJsonResponse<TrackMetadataFormValues>(response)
}

export async function writeTrackMetadata(formData: FormData): Promise<IDownloadedFile> {
  const response = await fetch(API_ROUTES.WRITE_TRACK_METADATA, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    await throwResponseError(response)
  }

  return {
    blob: await response.blob(),
    fileName: parseFileNameFromContentDisposition(response.headers.get('Content-Disposition')),
    contentType: response.headers.get('Content-Type') || undefined,
  }
}
