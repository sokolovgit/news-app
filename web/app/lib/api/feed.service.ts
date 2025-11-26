/**
 * Feed API service (uses raw-posts endpoint)
 */

import type { GetFeedQuery, GetFeedResponse } from '~/types/posts.types'
import type { ApiClient } from './api-client'

export class FeedService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Get user feed with pagination and filters
   */
  async getFeed(query?: GetFeedQuery): Promise<GetFeedResponse> {
    return this.apiClient.get<GetFeedResponse>('/raw-posts', query)
  }
}

