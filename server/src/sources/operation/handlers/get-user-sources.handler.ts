import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { UserSourcesService } from '@/user-sources';

import { createPaginatedResult } from '@/commons/types';

import { GetUserSourcesRequest } from '../requests';
import { GetUserSourcesResponse } from '../responses';

@Injectable()
export class GetUserSourcesHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly userSourcesService: UserSourcesService,
  ) {}

  async handle(
    request: GetUserSourcesRequest,
  ): Promise<GetUserSourcesResponse> {
    this.logger.log(
      `Handling get user sources request for user ${request.userId}, offset=${request.pagination.offset}, limit=${request.pagination.limit}`,
    );

    const paginatedResult = await this.userSourcesService.getAllByUserPaginated(
      request.userId,
      request.pagination,
      {
        withSource: true,
      },
    );

    return createPaginatedResult(
      paginatedResult.data,
      paginatedResult.total,
      request.pagination,
    );
  }
}
