/**
 * API-specific type definitions
 */

import type { PaginationParams, SortParams, FilterParam } from './common.types'

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * API Request configuration
 */
export interface ApiRequestConfig {
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, any>
  body?: any
  timeout?: number
  withCredentials?: boolean
  signal?: AbortSignal
}

/**
 * Query parameters for list endpoints
 */
export interface ListQueryParams extends PaginationParams {
  sort?: SortParams | SortParams[]
  filters?: FilterParam[]
  search?: string
  includes?: string[]
}

/**
 * Standardized API error response
 */
export interface ApiErrorResponse {
  statusCode: number
  message: string
  error: string
  timestamp: string
  path?: string
  method?: string
  details?: Record<string, any>
}

/**
 * API client options
 */
export interface ApiClientOptions {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  retryAttempts?: number
  retryDelay?: number
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>
  onResponse?: (response: any) => any | Promise<any>
  onError?: (error: any) => void | Promise<void>
}

/**
 * Upload progress callback
 */
export interface UploadProgressEvent {
  loaded: number
  total: number
  percentage: number
}

export type UploadProgressCallback = (event: UploadProgressEvent) => void

/**
 * File upload request
 */
export interface FileUploadRequest {
  file: File
  fieldName?: string
  additionalData?: Record<string, any>
  onProgress?: UploadProgressCallback
}

/**
 * Batch request
 */
export interface BatchRequest {
  id: string
  endpoint: string
  method: HttpMethod
  body?: any
}

export interface BatchResponse<T = any> {
  id: string
  success: boolean
  data?: T
  error?: ApiErrorResponse
}

