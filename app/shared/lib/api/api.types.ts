export interface ApiSuccessPayload<T> {
  success: true
  message?: string
  data?: T
}

export interface ApiErrorPayload {
  success: false
  error?: string
}

export type ApiJsonResponse<T> = ApiSuccessPayload<T> | ApiErrorPayload

export interface DownloadedFile {
  blob: Blob
  fileName?: string
  contentType?: string
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | null
  json?: unknown
}

export class ApiClientError extends Error {
  readonly status: number
  readonly payload?: ApiErrorPayload | unknown

  constructor(message: string, status: number, payload?: ApiErrorPayload | unknown) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.payload = payload
  }
}
