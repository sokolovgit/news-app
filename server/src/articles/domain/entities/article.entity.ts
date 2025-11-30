import { LoadState } from '@/commons/types';
import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';
import { RawPost } from '@/raw-posts/domain/entities';

import { ArticleId } from '../schemas';
import { EditorJsContent } from '../types';
import { ArticleStatus } from '../enums';

export type ArticleProperties = {
  id: ArticleId;
  authorId: UserId;
  title: string;
  slug?: string;
  description?: string;
  content: EditorJsContent;
  coverImageUrl?: string;
  status: ArticleStatus;
  publishedAt?: Date;
  viewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ArticleRelations = {
  author: LoadState<User>;
  sourceRawPosts: LoadState<RawPost[]>;
};

export type ArticleLoadOptions = {
  withAuthor?: boolean;
  withSourceRawPosts?: boolean;
};

export class Article {
  private readonly authorAccessor = this.relations.author.bindTo(
    this.constructor.name,
    User.name,
  );
  private readonly sourceRawPostsAccessor =
    this.relations.sourceRawPosts.bindTo(this.constructor.name, RawPost.name);

  public constructor(
    private props: ArticleProperties,
    private readonly relations: ArticleRelations,
  ) {}

  getId(): ArticleId {
    return this.props.id;
  }

  getAuthorId(): UserId {
    return this.props.authorId;
  }

  getAuthor(): User | null {
    return this.authorAccessor.getOrThrow();
  }

  getTitle(): string {
    return this.props.title;
  }

  getSlug(): string | undefined {
    return this.props.slug;
  }

  getDescription(): string | undefined {
    return this.props.description;
  }

  getContent(): EditorJsContent {
    return this.props.content;
  }

  getCoverImageUrl(): string | undefined {
    return this.props.coverImageUrl;
  }

  getStatus(): ArticleStatus {
    return this.props.status;
  }

  getPublishedAt(): Date | undefined {
    return this.props.publishedAt;
  }

  getViewCount(): number {
    return this.props.viewCount;
  }

  getCreatedAt(): Date | undefined {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  getSourceRawPosts(): RawPost[] | null {
    return this.sourceRawPostsAccessor.getOrThrow();
  }

  hasAuthorLoaded(): boolean {
    return this.authorAccessor.isLoaded();
  }

  hasSourceRawPostsLoaded(): boolean {
    return this.sourceRawPostsAccessor.isLoaded();
  }

  isDraft(): boolean {
    return this.props.status === ArticleStatus.DRAFT;
  }

  isPublished(): boolean {
    return this.props.status === ArticleStatus.PUBLISHED;
  }

  isArchived(): boolean {
    return this.props.status === ArticleStatus.ARCHIVED;
  }

  isOwnedBy(userId: UserId): boolean {
    return this.props.authorId === userId;
  }

  // Mutation methods
  updateTitle(title: string): void {
    this.props.title = title;
  }

  updateDescription(description: string | undefined): void {
    this.props.description = description;
  }

  updateContent(content: EditorJsContent): void {
    this.props.content = content;
  }

  updateCoverImageUrl(url: string | undefined): void {
    this.props.coverImageUrl = url;
  }

  updateSlug(slug: string): void {
    this.props.slug = slug;
  }

  publish(): void {
    this.props.status = ArticleStatus.PUBLISHED;
    this.props.publishedAt = new Date();
  }

  unpublish(): void {
    this.props.status = ArticleStatus.DRAFT;
    this.props.publishedAt = undefined;
  }

  archive(): void {
    this.props.status = ArticleStatus.ARCHIVED;
  }

  incrementViewCount(): void {
    this.props.viewCount += 1;
  }

  toJSON() {
    return {
      id: this.getId(),
      authorId: this.getAuthorId(),
      title: this.getTitle(),
      slug: this.getSlug(),
      description: this.getDescription(),
      content: this.getContent(),
      coverImageUrl: this.getCoverImageUrl(),
      status: this.getStatus(),
      publishedAt: this.getPublishedAt(),
      viewCount: this.getViewCount(),
      createdAt: this.getCreatedAt(),
      updatedAt: this.getUpdatedAt(),
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
