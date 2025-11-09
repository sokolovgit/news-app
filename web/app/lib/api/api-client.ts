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
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL)
    
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
  private buildBody(body: any): BodyInit | null {
    if (!body) return null
    
    if (body instanceof FormData) {
      return body
    }
    
    if (typeof body === 'object') {
      return JSON.stringify(body)
    }
    
    return body
  }

  /**
   * Generic request method
   */
  async request<T = any>(
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
      
      return await this.handleSuccessResponse(response)
    } catch (error) {
      throw this.transformError(error)
    }
  }

  /**
   * Handle successful response
   */
  private async handleSuccessResponse(response: Response): Promise<any> {
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
  private transformError(error: any): Error {
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
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  async patch<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly error: string
  public readonly timestamp: string
  public readonly details?: Record<string, any>

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

