import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { Article } from '@/articles/domain/entities';
import { ArticleId } from '@/articles/domain/schemas';
import { ArticlesService } from '@/articles/service/articles-service';
import { UserId } from '@/users/domain/schemas';

@Injectable()
export class PublishArticleHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly articlesService: ArticlesService,
  ) {}

  async handle(articleId: ArticleId, userId: UserId): Promise<Article> {
    this.logger.debug(`Publishing article: ${articleId} for user: ${userId}`);

    const article = await this.articlesService.publishArticle(
      articleId,
      userId,
    );

    this.logger.debug(`Article published: ${articleId}`);

    return article;
  }
}
