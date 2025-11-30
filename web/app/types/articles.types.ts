/**
 * Article-related types matching backend DTOs
 */

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// === Editor.js Block Data Types ===

export interface ParagraphBlockData {
  text: string
}

export interface HeaderBlockData {
  text: string
  level: 1 | 2 | 3 | 4 | 5 | 6
}

export interface ImageBlockData {
  file: {
    url: string
  }
  caption?: string
  withBorder?: boolean
  withBackground?: boolean
  stretched?: boolean
}

export interface ListBlockData {
  style: 'ordered' | 'unordered' | 'checklist'
  items: (string | ListItem)[]
  meta?: {
    counterType?: 'numeric' | 'lower-roman' | 'upper-roman' | 'lower-alpha' | 'upper-alpha'
    start?: number
  }
}

export interface ListItem {
  content: string
  meta?: {
    checked?: boolean
    counterType?: string
  }
  items?: ListItem[]
}

export interface QuoteBlockData {
  text: string
  caption?: string
  alignment?: 'left' | 'center'
}

export interface CodeBlockData {
  code: string
  language?: string
}

export interface EmbedBlockData {
  service: string
  source: string
  embed: string
  width?: number
  height?: number
  caption?: string
}

export interface DelimiterBlockData {
  // No data
}

export interface WarningBlockData {
  title: string
  message: string
}

// === Block Types ===

export type EditorJsBlockType =
  | 'paragraph'
  | 'header'
  | 'image'
  | 'list'
  | 'quote'
  | 'code'
  | 'embed'
  | 'delimiter'
  | 'warning'

export interface EditorJsBlock<T = unknown> {
  id?: string
  type: EditorJsBlockType
  data: T
}

export type ParagraphBlock = EditorJsBlock<ParagraphBlockData> & { type: 'paragraph' }
export type HeaderBlock = EditorJsBlock<HeaderBlockData> & { type: 'header' }
export type ImageBlock = EditorJsBlock<ImageBlockData> & { type: 'image' }
export type ListBlock = EditorJsBlock<ListBlockData> & { type: 'list' }
export type QuoteBlock = EditorJsBlock<QuoteBlockData> & { type: 'quote' }
export type CodeBlock = EditorJsBlock<CodeBlockData> & { type: 'code' }
export type EmbedBlock = EditorJsBlock<EmbedBlockData> & { type: 'embed' }
export type DelimiterBlock = EditorJsBlock<DelimiterBlockData> & { type: 'delimiter' }
export type WarningBlock = EditorJsBlock<WarningBlockData> & { type: 'warning' }

export type ContentBlock =
  | ParagraphBlock
  | HeaderBlock
  | ImageBlock
  | ListBlock
  | QuoteBlock
  | CodeBlock
  | EmbedBlock
  | DelimiterBlock
  | WarningBlock

// === Main Content Type ===

export interface EditorJsContent {
  time?: number
  blocks: ContentBlock[]
  version?: string
}

// === Article Types ===

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
