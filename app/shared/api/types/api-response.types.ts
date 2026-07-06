export interface ISuccessResponse<T> {
  success: true
  message?: string
  data?: T
}

export interface IErrorResponse {
  success: false
  error?: string
}

export type IApiResponse<T> = ISuccessResponse<T> | IErrorResponse
