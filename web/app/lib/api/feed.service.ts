/**
 * Feed API service (uses raw-posts endpoint)
 */

import type { FeedPost, GetFeedQuery, GetFeedResponse } from '~/types/posts.types'
import type { ApiClient } from './api-client'

export class FeedService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Get user feed with pagination and filters
   */
  async getFeed(query?: GetFeedQuery): Promise<GetFeedResponse> {
    const params: Record<string, string | number | boolean | null | undefined> = {}
    
    if (query?.offset !== undefined) params.offset = query.offset
    if (query?.limit !== undefined) params.limit = query.limit
    if (query?.sortField) params.sortField = query.sortField
    if (query?.sortOrder) params.sortOrder = query.sortOrder
    if (query?.search) params.search = query.search
    if (query?.dateFrom) params.dateFrom = query.dateFrom
    if (query?.dateTo) params.dateTo = query.dateTo
    if (query?.sourceIds && query.sourceIds.length > 0) {
      params.sourceIds = query.sourceIds.join(',')
    }
    
    return this.apiClient.get<GetFeedResponse>('/raw-posts', params)
  }

  /**
   * Get a single post by ID
   */
  async getPostById(id: string): Promise<FeedPost> {
    return this.apiClient.get<FeedPost>(`/raw-posts/${id}`)
  }
}
