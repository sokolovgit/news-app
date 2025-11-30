import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { Article } from '@/articles/domain/entities';
import { ArticleId } from '@/articles/domain/schemas';
import { ArticlesService } from '@/articles/service/articles-service';
import { UserId } from '@/users/domain/schemas';

@Injectable()
export class UnpublishArticleHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly articlesService: ArticlesService,
  ) {}

  async handle(articleId: ArticleId, userId: UserId): Promise<Article> {
    this.logger.debug(`Unpublishing article: ${articleId} for user: ${userId}`);

    const article = await this.articlesService.unpublishArticle(
      articleId,
      userId,
    );

    this.logger.debug(`Article unpublished: ${articleId}`);

    return article;
  }
}
