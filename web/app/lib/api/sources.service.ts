/**
 * Sources API service
 */

import type { ApiClient } from './api-client'

export interface ValidateSourceRequest {
  url: string
}

export interface ValidateSourceResponse {
  url: string
  name: string
  source: 'telegram' | 'instagram'
}

export interface AddSourceRequest {
  url: string
}

export interface AddSourceResponse {
  source: {
    id: string
    name: string
    url: string
    source: 'telegram' | 'instagram'
  }
  userSource: {
    id: string
    userId: string
    sourceId: string
  }
  isNewSource: boolean
  isNewLink: boolean
}

export interface UserSourceResponse {
  id: string
  userId: string
  sourceId: string
  source: {
    id: string
    name: string
    url: string
    source: 'telegram' | 'instagram' | 'rss'
    addedBy?: string
    createdAt?: string
    updatedAt?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface GetUserSourcesParams {
  offset?: number
  limit?: number
}

export interface GetUserSourcesResponse {
  data: UserSourceResponse[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
}

export class SourcesService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Validate a source URL
   */
  async validateSource(url: string): Promise<ValidateSourceResponse> {
    return this.apiClient.post<ValidateSourceResponse>('/sources/validate', { url })
  }

  /**
   * Add a source (follow a source)
   */
  async addSource(url: string): Promise<AddSourceResponse> {
    return this.apiClient.post<AddSourceResponse>('/sources', { url })
  }

  /**
   * Get paginated sources followed by the current user
   */
  async getUserSources(params?: GetUserSourcesParams): Promise<GetUserSourcesResponse> {
    const queryParams: Record<string, string | number | boolean | null | undefined> = {}
    if (params?.offset !== undefined) {
      queryParams.offset = params.offset
    }
    if (params?.limit !== undefined) {
      queryParams.limit = params.limit
    }
    return this.apiClient.get<GetUserSourcesResponse>('/sources/user', queryParams)
  }
}

