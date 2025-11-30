import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { ArticleId } from '@/articles/domain/schemas';
import { ArticlesService } from '@/articles/service/articles-service';
import { UserId } from '@/users/domain/schemas';

@Injectable()
export class DeleteArticleHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly articlesService: ArticlesService,
  ) {}

  async handle(articleId: ArticleId, userId: UserId): Promise<void> {
    this.logger.debug(`Deleting article: ${articleId} for user: ${userId}`);

    await this.articlesService.deleteArticle(articleId, userId);

    this.logger.debug(`Article deleted: ${articleId}`);
  }
}
