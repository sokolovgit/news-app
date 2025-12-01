/**
 * Sources API service
 */

import type { ApiClient } from './api-client'

export type SourceType = 'telegram' | 'instagram' | 'rss' | 'twitter'

export interface ValidateSourceRequest {
  url: string
}

export interface ValidateSourceResponse {
  url: string
  name: string
  source: SourceType
}

export interface AddSourceRequest {
  url: string
}

export interface AddSourceResponse {
  source: {
    id: string
    name: string
    url: string
    source: SourceType
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
    source: SourceType
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
  search?: string
  sourceType?: SourceType
}

export interface GetUserSourcesResponse {
  data: UserSourceResponse[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
}

export interface GetAllSourcesParams {
  offset?: number
  limit?: number
  search?: string
  sourceType?: SourceType
}

export interface SourceWithSubscriptionStatusResponse {
  source: {
    id: string
    name: string
    url: string
    source: SourceType
    addedBy?: string
    createdAt?: string
    updatedAt?: string
  }
  isSubscribed: boolean
}

export interface GetAllSourcesResponse {
  data: SourceWithSubscriptionStatusResponse[]
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
    if (params?.search) {
      queryParams.search = params.search
    }
    if (params?.sourceType) {
      queryParams.sourceType = params.sourceType
    }
    return this.apiClient.get<GetUserSourcesResponse>('/sources/user', queryParams)
  }

  /**
   * Get all public sources with subscription status
   */
  async getAllSources(params?: GetAllSourcesParams): Promise<GetAllSourcesResponse> {
    const queryParams: Record<string, string | number | boolean | null | undefined> = {}
    if (params?.offset !== undefined) {
      queryParams.offset = params.offset
    }
    if (params?.limit !== undefined) {
      queryParams.limit = params.limit
    }
    if (params?.search) {
      queryParams.search = params.search
    }
    if (params?.sourceType) {
      queryParams.sourceType = params.sourceType
    }
    return this.apiClient.get<GetAllSourcesResponse>('/sources', queryParams)
  }

  /**
   * Get distinct source types from user's subscribed sources
   */
  async getUserSourceTypes(): Promise<SourceType[]> {
    return this.apiClient.get<SourceType[]>('/sources/user/types')
  }
}
