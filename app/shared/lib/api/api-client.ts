import {
  ApiClientError,
  ApiErrorPayload,
  ApiJsonResponse,
  ApiRequestOptions,
  DownloadedFile,
} from './api.types'

const JSON_CONTENT_TYPE = 'application/json'

const createRequestInit = ({
  body,
  headers,
  json,
  ...init
}: ApiRequestOptions = {}): RequestInit => {
  if (json === undefined) {
    return {
      ...init,
      body,
      headers,
    }
  }

  return {
    ...init,
    body: JSON.stringify(json),
    headers: {
      'Content-Type': JSON_CONTENT_TYPE,
      ...headers,
    },
  }
}

const isJsonContentType = (contentType: string | null): boolean =>
  contentType?.includes(JSON_CONTENT_TYPE) ?? false

const getApiErrorMessage = (status: number, payload?: ApiErrorPayload | unknown): string => {
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error
  }

  return `Request failed with status ${status}`
}

const readErrorPayload = async (
  response: Response
): Promise<ApiErrorPayload | string | undefined> => {
  const contentType = response.headers.get('Content-Type')

  if (isJsonContentType(contentType)) {
    return (await response.json()) as ApiErrorPayload
  }

  const text = await response.text()
  return text || undefined
}

const parseFileName = (contentDisposition: string | null): string | undefined => {
  if (!contentDisposition) {
    return undefined
  }

  const match = contentDisposition.match(/filename="?([^";]+)"?/)?.[1]
  return match || undefined
}

const throwRequestError = async (response: Response): Promise<never> => {
  const payload = await readErrorPayload(response)

  throw new ApiClientError(getApiErrorMessage(response.status, payload), response.status, payload)
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await fetch(input, createRequestInit(options))

  if (!response.ok) {
    await throwRequestError(response)
  }

  const payload = (await response.json()) as ApiJsonResponse<T>

  if (!payload.success) {
    throw new ApiClientError(getApiErrorMessage(response.status, payload), response.status, payload)
  }

  return payload.data as T
}

export async function requestBlob(
  input: RequestInfo | URL,
  options?: ApiRequestOptions
): Promise<DownloadedFile> {
  const response = await fetch(input, createRequestInit(options))

  if (!response.ok) {
    await throwRequestError(response)
  }

  return {
    blob: await response.blob(),
    fileName: parseFileName(response.headers.get('Content-Disposition')),
    contentType: response.headers.get('Content-Type') || undefined,
  }
}
