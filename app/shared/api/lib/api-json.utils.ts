import type { IApiResponse } from '@/app/shared/api/types'
import { throwResponseError } from './api-error.utils'

export async function parseApiJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    await throwResponseError(response)
  }

  const payload = (await response.json()) as IApiResponse<T>

  if (!payload.success) {
    throw new Error(payload.error ?? `Request failed with status ${response.status}`)
  }

  if (payload.data === undefined) {
    throw new Error('Response succeeded but returned no data')
  }

  return payload.data
}
