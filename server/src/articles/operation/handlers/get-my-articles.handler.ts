import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { ArticlesService } from '@/articles/service/articles-service';

import { GetMyArticlesRequest } from '../requests';
import { GetArticlesResponse } from '../responses';

@Injectable()
export class GetMyArticlesHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly articlesService: ArticlesService,
  ) {}

  async handle(request: GetMyArticlesRequest): Promise<GetArticlesResponse> {
    this.logger.debug(`Getting articles for user: ${request.userId}`);

    const result = await this.articlesService.getMyArticles(
      {
        authorId: request.userId,
        status: request.status,
        search: request.search,
        sort: request.sort,
        offset: request.offset,
        limit: request.limit,
      },
      { withAuthor: true },
    );

    this.logger.debug(
      `Found ${result.total} articles for user: ${request.userId}`,
    );

    return result;
  }
}
