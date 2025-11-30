/**
 * API Client Configuration
 * Base HTTP client for making API requests
 */

import type { ApiRequestConfig, ApiClientOptions, ApiErrorResponse } from '~/types'

export class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private timeout: number
  private retryAttempts: number
  private retryDelay: number

  constructor(options: ApiClientOptions) {
    this.baseURL = options.baseURL
    this.defaultHeaders = options.headers || {}
    this.timeout = options.timeout || 30000
    this.retryAttempts = options.retryAttempts || 3
    this.retryDelay = options.retryDelay || 1000
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): string {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const normalizedBaseURL = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`
    
    const url = new URL(normalizedEndpoint, normalizedBaseURL)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)))
          } else {
            url.searchParams.append(key, String(value))
          }
        }
      })
    }
    
    return url.toString()
  }

  /**
   * Build request headers
   */
  private buildHeaders(config?: ApiRequestConfig): Headers {
    const headers = new Headers()
    
    // Add default headers
    Object.entries(this.defaultHeaders).forEach(([key, value]) => {
      headers.set(key, value)
    })
    
    // Add config headers
    if (config?.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        headers.set(key, value)
      })
    }
    
    // Add content type if body exists and not FormData
    if (config?.body && !(config.body instanceof FormData)) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }
    }
    
    return headers
  }

  /**
   * Build request body
   */
  private buildBody(body: unknown): BodyInit | null {
    if (!body) return null
    
    if (body instanceof FormData) {
      return body
    }
    
    if (typeof body === 'object') {
      return JSON.stringify(body)
    }

    // Ensure primitive types are returned as strings and treat {} specially
    if (
      (typeof body === 'string') ||
      (typeof body === 'number') ||
      (typeof body === 'boolean')
    ) {
      return String(body);
    }

    // If body is an empty object ({}), treat as null (to avoid fetch TypeError)
    if (
      typeof body === 'object' &&
      body !== null &&
      Object.keys(body).length === 0 &&
      body.constructor === Object
    ) {
      return null;
    }

    // Otherwise, return null for unsupported types (e.g. symbols, undefined)
    return null;
  }

  /**
   * Generic request method
   */
  async request<T = unknown>(
    endpoint: string,
    config?: ApiRequestConfig,
  ): Promise<T> {
    const url = this.buildUrl(endpoint, config?.params)
    const headers = this.buildHeaders(config)
    const body = this.buildBody(config?.body)
    
    const requestInit: RequestInit = {
      method: config?.method || 'GET',
      headers,
      body,
      signal: config?.signal,
      credentials: config?.withCredentials ? 'include' : 'same-origin',
    }
    
    try {
      const response = await fetch(url, requestInit)
      
      if (!response.ok) {
        const error = await this.handleErrorResponse(response)
        throw error
      }
      
      return await this.handleSuccessResponse(response) as T
    } catch (error) {
      throw this.transformError(error)
    }
  }

  /**
   * Handle successful response
   */
  private async handleSuccessResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      return await response.json()
    }
    
    if (contentType?.includes('text')) {
      return await response.text()
    }
    
    if (contentType?.includes('blob')) {
      return await response.blob()
    }
    
    return await response.text()
  }

  /**
   * Handle error response
   */
  private async handleErrorResponse(response: Response): Promise<Error> {
    let errorData: ApiErrorResponse
    
    try {
      errorData = await response.json()
    } catch {
      errorData = {
        statusCode: response.status,
        message: response.statusText || 'An error occurred',
        error: 'UnknownError',
        timestamp: new Date().toISOString(),
      }
    }
    
    return new ApiError(errorData)
  }

  /**
   * Transform any error to ApiError
   */
  private transformError(error: unknown): Error {
    if (error instanceof ApiError) {
      return error
    }
    
    if (error instanceof Error) {
      return new ApiError({
        statusCode: 0,
        message: error.message,
        error: error.name,
        timestamp: new Date().toISOString(),
      })
    }
    
    return new ApiError({
      statusCode: 0,
      message: 'An unknown error occurred',
      error: 'UnknownError',
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Convenience methods
   */
  async get<T = unknown>(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  async put<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  async patch<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body })
  }

  async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async uploadFile<T = unknown>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: formData })
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly error: string
  public readonly timestamp: string
  public readonly details?: Record<string, unknown>

  constructor(data: ApiErrorResponse) {
    super(data.message)
    this.name = 'ApiError'
    this.statusCode = data.statusCode
    this.error = data.error
    this.timestamp = data.timestamp
    this.details = data.details
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500
  }

  get isServerError(): boolean {
    return this.statusCode >= 500
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0
  }
}

