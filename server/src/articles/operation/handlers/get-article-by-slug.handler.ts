import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { Article } from '@/articles/domain/entities';
import { ArticlesService } from '@/articles/service/articles-service';

@Injectable()
export class GetArticleBySlugHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly articlesService: ArticlesService,
  ) {}

  async handle(slug: string): Promise<Article> {
    this.logger.debug(`Getting article by slug: ${slug}`);

    // getArticleBySlugOrThrow already filters for published articles only
    // and throws ArticleNotFoundError if not found
    const article = await this.articlesService.getArticleBySlugOrThrow(slug, {
      withAuthor: true,
      withSourceRawPosts: true,
    });

    this.logger.debug(`Article found: ${article.getId()}`);

    return article;
  }
}

