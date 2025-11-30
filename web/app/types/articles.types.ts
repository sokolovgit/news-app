/**
 * Article-related types matching backend DTOs
 */

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface EditorJsBlock {
  id?: string
  type: string
  data: Record<string, unknown>
}

export interface EditorJsContent {
  time?: number
  blocks: EditorJsBlock[]
  version?: string
}

export interface ArticleAuthor {
  id: string
  email: string
}

export interface Article {
  id: string
  authorId: string
  title: string
  slug?: string
  description?: string
  content: EditorJsContent
  coverImageUrl?: string
  status: ArticleStatus
  publishedAt?: Date | string
  viewCount: number
  createdAt?: Date | string
  updatedAt?: Date | string
  author?: ArticleAuthor
}

export interface GetArticlesResponse {
  data: Article[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
}

export interface GetMyArticlesQuery {
  status?: ArticleStatus
  sortField?: 'createdAt' | 'updatedAt' | 'publishedAt'
  sortOrder?: 'asc' | 'desc'
  search?: string
  offset?: number
  limit?: number
}

export interface GetPublicArticlesQuery {
  sortField?: 'createdAt' | 'updatedAt' | 'publishedAt'
  sortOrder?: 'asc' | 'desc'
  search?: string
  offset?: number
  limit?: number
}

export interface CreateArticleRequest {
  title: string
  description?: string
  content: EditorJsContent
  coverImageUrl?: string
  sourceRawPostIds?: string[]
}

export interface UpdateArticleRequest {
  title?: string
  description?: string
  content?: EditorJsContent
  coverImageUrl?: string
  sourceRawPostIds?: string[]
}

