import { NextResponse } from 'next/server'

interface ISuccessResponse<T> {
  success: true
  message?: string
  data?: T
}

interface IErrorResponse {
  success: false
  error?: string
}

export type ApiResponse<T> = NextResponse<ISuccessResponse<T> | IErrorResponse>
