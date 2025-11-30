import { Inject, Injectable } from '@nestjs/common';
import { eq, sql, and, or, ilike, desc, asc, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { DRIZZLE_CONNECTION, drizzle } from '@/database';
import {
  createPaginatedResult,
  PaginatedResult,
  SortOrder,
} from '@/commons/types';
import { uuid } from '@/commons/utils';

import { Article, ArticleLoadOptions } from '@/articles/domain/entities';
import {
  ArticleId,
  articles,
  articleRawPosts,
  ArticleRawPostId,
} from '@/articles/domain/schemas';
import { ArticleStatus } from '@/articles/domain/enums';
import { RawPostId } from '@/raw-posts/domain/schemas';

import {
  ArticlesRepository,
  ArticlesSort,
  GetArticlesParams,
  GetPublicArticlesParams,
} from '../abstracts';
import { DrizzleArticlesEntityMapper } from './mappers';

@Injectable()
export class DrizzleArticlesRepository extends ArticlesRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION) private db: NodePgDatabase<typeof drizzle>,
  ) {
    super();
  }

  async getArticleById(
    id: ArticleId,
    loadOptions: ArticleLoadOptions = {},
  ): Promise<Article | null> {
    const article = await this.db.query.articles.findFirst({
      where: eq(articles.id, id),
      with: this.buildRelations(loadOptions),
    });

    return article
      ? DrizzleArticlesEntityMapper.toEntity(article, loadOptions)
      : null;
  }

  async getArticleBySlug(
    slug: string,
    loadOptions: ArticleLoadOptions = {},
  ): Promise<Article | null> {
    const article = await this.db.query.articles.findFirst({
      where: and(
        eq(articles.slug, slug),
        eq(articles.status, ArticleStatus.PUBLISHED),
      ),
      with: this.buildRelations(loadOptions),
    });

    return article
      ? DrizzleArticlesEntityMapper.toEntity(article, loadOptions)
      : null;
  }

  async save(article: Article): Promise<Article | null> {
    const [savedArticle] = await this.db
      .insert(articles)
      .values(DrizzleArticlesEntityMapper.toSchema(article))
      .returning();

    return savedArticle
      ? DrizzleArticlesEntityMapper.toEntity(savedArticle)
      : null;
  }

  async update(article: Article): Promise<Article | null> {
    const [updatedArticle] = await this.db
      .update(articles)
      .set({
        ...DrizzleArticlesEntityMapper.toSchema(article),
        updatedAt: new Date(),
      })
      .where(eq(articles.id, article.getId()))
      .returning();

    return updatedArticle
      ? DrizzleArticlesEntityMapper.toEntity(updatedArticle)
      : null;
  }

  async delete(id: ArticleId): Promise<void> {
    await this.db.delete(articles).where(eq(articles.id, id));
  }

  async getArticles(
    params: GetArticlesParams,
    loadOptions: ArticleLoadOptions = {},
  ): Promise<PaginatedResult<Article>> {
    const conditions = this.buildBaseConditions(params);

    if (params.authorId) {
      conditions.push(eq(articles.authorId, params.authorId));
    }

    if (params.status) {
      conditions.push(eq(articles.status, params.status));
    }

    return this.executeArticlesQuery(conditions, params, loadOptions);
  }

  async getPublicArticles(
    params: GetPublicArticlesParams,
    loadOptions: ArticleLoadOptions = {},
  ): Promise<PaginatedResult<Article>> {
    const conditions = this.buildBaseConditions(params);
    conditions.push(eq(articles.status, ArticleStatus.PUBLISHED));

    return this.executeArticlesQuery(conditions, params, loadOptions);
  }

  async linkRawPosts(
    articleId: ArticleId,
    rawPostIds: string[],
  ): Promise<void> {
    if (rawPostIds.length === 0) return;

    const links = rawPostIds.map((rawPostId) => ({
      id: uuid<ArticleRawPostId>(),
      articleId,
      rawPostId: rawPostId as RawPostId,
    }));

    await this.db.insert(articleRawPosts).values(links).onConflictDoNothing();
  }

  async unlinkAllRawPosts(articleId: ArticleId): Promise<void> {
    await this.db
      .delete(articleRawPosts)
      .where(eq(articleRawPosts.articleId, articleId));
  }

  async incrementViewCount(articleId: ArticleId): Promise<void> {
    await this.db
      .update(articles)
      .set({ viewCount: sql`${articles.viewCount} + 1` })
      .where(eq(articles.id, articleId));
  }

  // === Private Helpers ===

  private buildBaseConditions(params: { search?: string }): SQL[] {
    const conditions: SQL[] = [];

    if (params.search) {
      const searchPattern = `%${params.search}%`;
      conditions.push(
        or(
          ilike(articles.title, searchPattern),
          ilike(articles.description, searchPattern),
        )!,
      );
    }

    return conditions;
  }

  private buildOrderBy(sort?: ArticlesSort): SQL[] {
    const sortFieldMap = {
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      publishedAt: articles.publishedAt,
    };

    const field = sort?.field ? sortFieldMap[sort.field] : articles.createdAt;
    const order = sort?.order === SortOrder.ASC ? asc : desc;

    return [order(field)];
  }

  private buildRelations(loadOptions: ArticleLoadOptions) {
    return {
      ...(loadOptions.withAuthor && { author: true as const }),
      ...(loadOptions.withSourceRawPosts && {
        sourceRawPosts: { with: { rawPost: true as const } },
      }),
    };
  }

  private async executeArticlesQuery(
    conditions: SQL[],
    params: { sort?: ArticlesSort; offset: number; limit: number },
    loadOptions: ArticleLoadOptions,
  ): Promise<PaginatedResult<Article>> {
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await this.db.query.articles.findMany({
      where: whereClause,
      orderBy: this.buildOrderBy(params.sort),
      with: this.buildRelations(loadOptions),
      limit: params.limit,
      offset: params.offset,
      extras: {
        total: sql<number>`count(*) over()`.as('total'),
      },
    });

    const total = data[0]?.total ?? 0;
    const articleEntities = data.map((article) =>
      DrizzleArticlesEntityMapper.toEntity(article, loadOptions),
    );

    return createPaginatedResult(articleEntities, total, {
      offset: params.offset,
      limit: params.limit,
    });
  }
}
