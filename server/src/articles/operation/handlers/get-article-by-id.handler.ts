import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { Article } from '@/articles/domain/entities';
import { ArticlesService } from '@/articles/service/articles-service';
import { UnauthorizedArticleAccessError } from '@/articles/domain/errors';

import { GetArticleByIdRequest } from '../requests';

@Injectable()
export class GetArticleByIdHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly articlesService: ArticlesService,
  ) {}

  async handle(request: GetArticleByIdRequest): Promise<Article> {
    this.logger.debug(
      `Getting article: ${request.articleId} for user: ${request.userId}`,
    );

    const article = await this.articlesService.getArticleByIdOrThrow(
      request.articleId,
      { withAuthor: true, withSourceRawPosts: true },
    );

    // Check ownership for draft/archived articles
    if (!article.isPublished() && !article.isOwnedBy(request.userId)) {
      throw new UnauthorizedArticleAccessError(
        request.articleId,
        request.userId,
      );
    }

    this.logger.debug(`Article found: ${article.getId()}`);

    return article;
  }
}
