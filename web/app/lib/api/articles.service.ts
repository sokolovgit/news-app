/**
 * Articles API service
 */

import type {
  Article,
  GetArticlesResponse,
  GetMyArticlesQuery,
  GetPublicArticlesQuery,
  CreateArticleRequest,
  UpdateArticleRequest,
} from '~/types/articles.types'
import type { ApiClient } from './api-client'

export class ArticlesService {
  constructor(private apiClient: ApiClient) {}

  // === Public Articles ===

  /**
   * Get public (published) articles
   */
  async getPublicArticles(query?: GetPublicArticlesQuery): Promise<GetArticlesResponse> {
    return this.apiClient.get<GetArticlesResponse>('/articles', query as Record<string, string | number | boolean | null | undefined>)
  }

  /**
   * Get a public article by slug
   */
  async getArticleBySlug(slug: string): Promise<Article> {
    return this.apiClient.get<Article>(`/articles/read/${slug}`)
  }

  // === User's Own Articles ===

  /**
   * Get current user's articles
   */
  async getMyArticles(query?: GetMyArticlesQuery): Promise<GetArticlesResponse> {
    return this.apiClient.get<GetArticlesResponse>('/articles/my', query as Record<string, string | number | boolean | null | undefined>)
  }

  /**
   * Get a single article by ID (owned by current user)
   */
  async getMyArticleById(id: string): Promise<Article> {
    return this.apiClient.get<Article>(`/articles/my/${id}`)
  }

  /**
   * Create a new article
   */
  async createArticle(data: CreateArticleRequest): Promise<Article> {
    return this.apiClient.post<Article>('/articles', data)
  }

  /**
   * Update an article
   */
  async updateArticle(id: string, data: UpdateArticleRequest): Promise<Article> {
    return this.apiClient.patch<Article>(`/articles/my/${id}`, data)
  }

  /**
   * Delete an article
   */
  async deleteArticle(id: string): Promise<void> {
    return this.apiClient.delete(`/articles/my/${id}`)
  }

  /**
   * Publish an article
   */
  async publishArticle(id: string): Promise<Article> {
    return this.apiClient.post<Article>(`/articles/my/${id}/publish`)
  }

  /**
   * Unpublish an article (convert to draft)
   */
  async unpublishArticle(id: string): Promise<Article> {
    return this.apiClient.post<Article>(`/articles/my/${id}/unpublish`)
  }
}

