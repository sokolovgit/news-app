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
}

