import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { Article } from '@/articles/domain/entities';
import { ArticlesService } from '@/articles/service/articles-service';

import { CreateArticleRequest } from '../requests';

@Injectable()
export class CreateArticleHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly articlesService: ArticlesService,
  ) {}

  async handle(request: CreateArticleRequest): Promise<Article> {
    this.logger.debug(`Creating article for user: ${request.userId}`);

    const article = await this.articlesService.createArticle(
      {
        title: request.title,
        description: request.description,
        content: request.content,
        coverImageUrl: request.coverImageUrl,
        sourceRawPostIds: request.sourceRawPostIds,
      },
      request.userId,
    );

    this.logger.debug(`Article created: ${article.getId()}`);

    return article;
  }
}
