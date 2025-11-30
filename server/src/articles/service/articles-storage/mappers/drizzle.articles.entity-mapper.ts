import { loadRelation } from '@/commons/database';

import { Article, ArticleLoadOptions } from '@/articles/domain/entities';
import {
  ArticleInsert,
  ArticleSelect,
  ArticleRawPostSelect,
} from '@/articles/domain/schemas';
import { ArticleStatus } from '@/articles/domain/enums';

import { UserId, UserSelect } from '@/users/domain/schemas';
import { DrizzleUserEntityMapper } from '@/users/service/users-storage/mappers';

import { RawPostSelect } from '@/raw-posts/domain/schemas';
import { DrizzleRawPostsEntityMapper } from '@/raw-posts/service/raw-posts-storage/mappers';

export class DrizzleArticlesEntityMapper {
  static toEntity(
    data: ArticleSelect & {
      author?: UserSelect | null;
      sourceRawPosts?: (ArticleRawPostSelect & {
        rawPost?: RawPostSelect | null;
      })[];
    },
    loadOptions: ArticleLoadOptions = {},
  ): Article {
    return new Article(
      {
        id: data.id,
        authorId: data.authorId as UserId,
        title: data.title,
        slug: data.slug ?? undefined,
        description: data.description ?? undefined,
        content: data.content,
        coverImageUrl: data.coverImageUrl ?? undefined,
        status: data.status as ArticleStatus,
        publishedAt: data.publishedAt ?? undefined,
        viewCount: data.viewCount,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      {
        author: loadRelation(loadOptions.withAuthor, data.author, (author) =>
          DrizzleUserEntityMapper.toEntity(author),
        ),
        sourceRawPosts: loadRelation(
          loadOptions.withSourceRawPosts,
          data.sourceRawPosts
            ?.map((link) => link.rawPost)
            .filter((rp): rp is RawPostSelect => rp != null),
          (rawPosts) =>
            rawPosts.map((rp) => DrizzleRawPostsEntityMapper.toEntity(rp)),
        ),
      },
    );
  }

  static toSchema(entity: Article): ArticleInsert {
    return {
      id: entity.getId(),
      authorId: entity.getAuthorId(),
      title: entity.getTitle(),
      slug: entity.getSlug(),
      description: entity.getDescription(),
      content: entity.getContent(),
      coverImageUrl: entity.getCoverImageUrl(),
      status: entity.getStatus(),
      publishedAt: entity.getPublishedAt(),
      viewCount: entity.getViewCount(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
