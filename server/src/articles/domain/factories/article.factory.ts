import { uuid } from '@/commons/utils';
import { LoadState } from '@/commons/types';
import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';
import { RawPost } from '@/raw-posts/domain/entities';

import { Article } from '../entities';
import { ArticleId } from '../schemas';
import { CreateArticlePayload } from '../types';
import { ArticleStatus } from '../enums';

export class ArticleFactory {
  static create(payload: CreateArticlePayload, authorId: UserId): Article {
    return new Article(
      {
        id: uuid<ArticleId>(),
        authorId,
        title: payload.title,
        description: payload.description,
        content: payload.content,
        coverImageUrl: payload.coverImageUrl,
        status: ArticleStatus.DRAFT,
        viewCount: 0,
      },
      {
        author: LoadState.notLoaded<User>(),
        sourceRawPosts: LoadState.notLoaded<RawPost[]>(),
      },
    );
  }

  static generateSlug(title: string, id: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .substring(0, 100); // Limit length

    // Append short ID suffix for uniqueness
    const shortId = id.substring(0, 8);
    return `${baseSlug}-${shortId}`;
  }
}
