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
    return this.apiClient.get<GetFeedResponse>('/raw-posts', query)
  }

  /**
   * Get a single post by ID
   */
  async getPostById(id: string): Promise<FeedPost> {
    return this.apiClient.get<FeedPost>(`/raw-posts/${id}`)
  }
}

