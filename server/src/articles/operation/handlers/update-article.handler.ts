import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { Article } from '@/articles/domain/entities';
import { ArticlesService } from '@/articles/service/articles-service';

import { UpdateArticleRequest } from '../requests';

@Injectable()
export class UpdateArticleHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly articlesService: ArticlesService,
  ) {}

  async handle(request: UpdateArticleRequest): Promise<Article> {
    this.logger.debug(
      `Updating article: ${request.articleId} for user: ${request.userId}`,
    );

    const article = await this.articlesService.updateArticle(
      request.articleId,
      {
        title: request.title,
        description: request.description,
        content: request.content,
        coverImageUrl: request.coverImageUrl,
        sourceRawPostIds: request.sourceRawPostIds,
      },
      request.userId,
    );

    this.logger.debug(`Article updated: ${article.getId()}`);

    return article;
  }
}
