import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/logger';
import { AdminService } from '../../service/admin-service/admin.service';

import { PaginatedResult } from '@/commons/types';
import { Article } from '@/articles/domain/entities';
import { GetAllArticlesRequest } from '../requests/get-all-articles.request';

@Injectable()
export class GetAllArticlesHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly adminService: AdminService,
  ) {}

  async handle(
    request: GetAllArticlesRequest,
  ): Promise<PaginatedResult<Article>> {
    this.logger.log(`Getting all articles: ${JSON.stringify(request)}`);

    return this.adminService.getAllArticlesPaginated(
      {
        offset: request.offset,
        limit: request.limit,
      },
      {
        search: request.search,
        sortField: request.sortField,
        sortOrder: request.sortOrder,
      },
    );
  }
}

