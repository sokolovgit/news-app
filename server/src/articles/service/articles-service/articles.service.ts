import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { PaginatedResult } from '@/commons/types';
import { UserId } from '@/users/domain/schemas';

import { ArticleId } from '@/articles/domain/schemas';
import { Article, ArticleLoadOptions } from '@/articles/domain/entities';
import {
  CreateArticlePayload,
  UpdateArticlePayload,
} from '@/articles/domain/types';
import { ArticleFactory } from '@/articles/domain/factories';
import {
  ArticleNotFoundError,
  ArticleCreationFailedError,
  UnauthorizedArticleAccessError,
  ArticleUpdateFailedError,
} from '@/articles/domain/errors';

import {
  ArticlesRepository,
  GetArticlesParams,
  GetPublicArticlesParams,
} from '../abstracts';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly logger: LoggerService,
    private readonly articlesRepository: ArticlesRepository,
  ) {}

  async getArticleById(
    id: ArticleId,
    loadOptions: ArticleLoadOptions = {},
  ): Promise<Article | null> {
    this.logger.log(
      `Getting article by ID: ${id} with load options: ${JSON.stringify(loadOptions)}`,
    );

    return await this.articlesRepository.getArticleById(id, loadOptions);
  }

  async getArticleByIdOrThrow(
    id: ArticleId,
    loadOptions: ArticleLoadOptions = {},
  ): Promise<Article> {
    const article = await this.getArticleById(id, loadOptions);

    if (!article) {
      throw new ArticleNotFoundError(id);
    }

    return article;
  }

  async getArticleBySlug(
    slug: string,
    loadOptions: ArticleLoadOptions = {},
  ): Promise<Article | null> {
    this.logger.log(`Getting article by slug: ${slug}`);

    return await this.articlesRepository.getArticleBySlug(slug, loadOptions);
  }

  async getArticleBySlugOrThrow(
    slug: string,
    loadOptions: ArticleLoadOptions = {},
  ): Promise<Article> {
    const article = await this.getArticleBySlug(slug, loadOptions);

    if (!article) {
      throw new ArticleNotFoundError(slug);
    }

    return article;
  }

  async createArticle(
    payload: CreateArticlePayload,
    authorId: UserId,
  ): Promise<Article> {
    this.logger.log(`Creating article for user: ${authorId}`);

    const article = ArticleFactory.create(payload, authorId);

    // Generate slug from title
    const slug = ArticleFactory.generateSlug(
      article.getTitle(),
      article.getId(),
    );
    article.updateSlug(slug);

    const savedArticle = await this.articlesRepository.save(article);

    if (!savedArticle) {
      throw new ArticleCreationFailedError();
    }

    // Link raw posts if provided
    if (payload.sourceRawPostIds && payload.sourceRawPostIds.length > 0) {
      await this.articlesRepository.linkRawPosts(
        savedArticle.getId(),
        payload.sourceRawPostIds,
      );
    }

    this.logger.log(`Article created with ID: ${savedArticle.getId()}`);

    return savedArticle;
  }

  async updateArticle(
    articleId: ArticleId,
    payload: UpdateArticlePayload,
    userId: UserId,
  ): Promise<Article> {
    this.logger.log(`Updating article: ${articleId} by user: ${userId}`);

    const article = await this.getArticleByIdOrThrow(articleId);

    // Check ownership
    if (!article.isOwnedBy(userId)) {
      throw new UnauthorizedArticleAccessError(articleId, userId);
    }

    // Apply updates
    if (payload.title !== undefined) {
      article.updateTitle(payload.title);
      // Regenerate slug if title changed
      const newSlug = ArticleFactory.generateSlug(payload.title, articleId);
      article.updateSlug(newSlug);
    }

    if (payload.description !== undefined) {
      article.updateDescription(payload.description);
    }

    if (payload.content !== undefined) {
      article.updateContent(payload.content);
    }

    if (payload.coverImageUrl !== undefined) {
      article.updateCoverImageUrl(payload.coverImageUrl);
    }

    const updatedArticle = await this.articlesRepository.update(article);

    if (!updatedArticle) {
      throw new ArticleUpdateFailedError(articleId);
    }

    // Update raw posts links if provided
    if (payload.sourceRawPostIds !== undefined) {
      await this.articlesRepository.unlinkAllRawPosts(articleId);
      if (payload.sourceRawPostIds.length > 0) {
        await this.articlesRepository.linkRawPosts(
          articleId,
          payload.sourceRawPostIds,
        );
      }
    }

    this.logger.log(`Article updated: ${articleId}`);

    return updatedArticle;
  }

  async deleteArticle(articleId: ArticleId, userId: UserId): Promise<void> {
    this.logger.log(`Deleting article: ${articleId} by user: ${userId}`);

    const article = await this.getArticleByIdOrThrow(articleId);

    // Check ownership
    if (!article.isOwnedBy(userId)) {
      throw new UnauthorizedArticleAccessError(articleId, userId);
    }

    await this.articlesRepository.delete(articleId);

    this.logger.log(`Article deleted: ${articleId}`);
  }

  async publishArticle(articleId: ArticleId, userId: UserId): Promise<Article> {
    this.logger.log(`Publishing article: ${articleId} by user: ${userId}`);

    const article = await this.getArticleByIdOrThrow(articleId);

    // Check ownership
    if (!article.isOwnedBy(userId)) {
      throw new UnauthorizedArticleAccessError(articleId, userId);
    }

    article.publish();

    const updatedArticle = await this.articlesRepository.update(article);

    if (!updatedArticle) {
      throw new ArticleUpdateFailedError(articleId);
    }

    this.logger.log(`Article published: ${articleId}`);

    return updatedArticle;
  }

  async unpublishArticle(
    articleId: ArticleId,
    userId: UserId,
  ): Promise<Article> {
    this.logger.log(`Unpublishing article: ${articleId} by user: ${userId}`);

    const article = await this.getArticleByIdOrThrow(articleId);

    // Check ownership
    if (!article.isOwnedBy(userId)) {
      throw new UnauthorizedArticleAccessError(articleId, userId);
    }

    article.unpublish();

    const updatedArticle = await this.articlesRepository.update(article);

    if (!updatedArticle) {
      throw new ArticleUpdateFailedError(articleId);
    }

    this.logger.log(`Article unpublished: ${articleId}`);

    return updatedArticle;
  }

  async getMyArticles(
    params: GetArticlesParams,
    loadOptions: ArticleLoadOptions = {},
  ): Promise<PaginatedResult<Article>> {
    this.logger.log(
      `Getting articles for user: ${params.authorId} with params: ${JSON.stringify(params)}`,
    );

    return await this.articlesRepository.getArticles(params, loadOptions);
  }

  async getPublicArticles(
    params: GetPublicArticlesParams,
    loadOptions: ArticleLoadOptions = {},
  ): Promise<PaginatedResult<Article>> {
    this.logger.log(
      `Getting public articles with params: ${JSON.stringify(params)}`,
    );

    return await this.articlesRepository.getPublicArticles(params, loadOptions);
  }

  async incrementViewCount(articleId: ArticleId): Promise<void> {
    await this.articlesRepository.incrementViewCount(articleId);
  }
}
