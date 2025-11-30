import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { ArticlesService } from '@/articles/service/articles-service';

import { GetPublicArticlesRequest } from '../requests';
import { GetArticlesResponse } from '../responses';

@Injectable()
export class GetPublicArticlesHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly articlesService: ArticlesService,
  ) {}

  async handle(
    request: GetPublicArticlesRequest,
  ): Promise<GetArticlesResponse> {
    this.logger.debug('Getting public articles');

    const result = await this.articlesService.getPublicArticles(
      {
        search: request.search,
        sort: request.sort,
        offset: request.offset,
        limit: request.limit,
      },
      { withAuthor: true },
    );

    this.logger.debug(`Found ${result.total} public articles`);

    return result;
  }
}
