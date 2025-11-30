import { PaginatedResult, Sort } from '@/commons/types';
import { UserId } from '@/users/domain/schemas';

import { Article, ArticleLoadOptions } from '@/articles/domain/entities';
import { ArticleId } from '@/articles/domain/schemas';
import { ArticleStatus } from '@/articles/domain/enums';

export type ArticlesSortField = 'createdAt' | 'updatedAt' | 'publishedAt';

export const ARTICLES_SORT_FIELDS: readonly ArticlesSortField[] = [
  'createdAt',
  'updatedAt',
  'publishedAt',
];

export type ArticlesSort = Sort<ArticlesSortField>;

export type GetArticlesParams = {
  authorId?: UserId;
  status?: ArticleStatus;
  search?: string;
  sort?: ArticlesSort;
  offset: number;
  limit: number;
};

export type GetPublicArticlesParams = {
  search?: string;
  sort?: ArticlesSort;
  offset: number;
  limit: number;
};

export abstract class ArticlesRepository {
  abstract getArticleById(
    id: ArticleId,
    relations?: ArticleLoadOptions,
  ): Promise<Article | null>;

  abstract getArticleBySlug(
    slug: string,
    relations?: ArticleLoadOptions,
  ): Promise<Article | null>;

  abstract save(article: Article): Promise<Article | null>;

  abstract update(article: Article): Promise<Article | null>;

  abstract delete(id: ArticleId): Promise<void>;

  abstract getArticles(
    params: GetArticlesParams,
    loadOptions?: ArticleLoadOptions,
  ): Promise<PaginatedResult<Article>>;

  abstract getPublicArticles(
    params: GetPublicArticlesParams,
    loadOptions?: ArticleLoadOptions,
  ): Promise<PaginatedResult<Article>>;

  abstract linkRawPosts(
    articleId: ArticleId,
    rawPostIds: string[],
  ): Promise<void>;

  abstract unlinkAllRawPosts(articleId: ArticleId): Promise<void>;

  abstract incrementViewCount(articleId: ArticleId): Promise<void>;
}
