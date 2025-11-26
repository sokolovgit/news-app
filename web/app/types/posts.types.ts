/**
 * Post-related types matching backend DTOs
 */

export enum ContentBlockType {
  PARAGRAPH = 'paragraph',
  HEADER = 'header',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export type ParagraphBlock = {
  type: ContentBlockType.PARAGRAPH
  data: { text: string }
}

export type HeaderBlock = {
  type: ContentBlockType.HEADER
  data: { text: string; level: 1 | 2 | 3 }
}

export type ImageBlock = {
  type: ContentBlockType.IMAGE
  data: { url: string; caption?: string }
}

export type AudioBlock = {
  type: ContentBlockType.AUDIO
  data: { url: string; caption?: string }
}

export type VideoBlock = {
  type: ContentBlockType.VIDEO
  data: { url: string; caption?: string }
}

export type ContentBlock = ParagraphBlock | HeaderBlock | ImageBlock | AudioBlock | VideoBlock

export type Content = ContentBlock[]

export interface SourceDto {
  id: string
  name: string
  url?: string
  type?: string
}

export interface FeedPost {
  id: string
  sourceId: string
  externalId: string
  title?: string
  content: Content
  createdAt?: Date | string
  updatedAt?: Date | string
  source?: SourceDto
}

export interface GetFeedResponse {
  data: FeedPost[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
}

export interface GetFeedQuery {
  sortField?: 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  search?: string
  dateFrom?: string
  dateTo?: string
  offset?: number
  limit?: number
}

