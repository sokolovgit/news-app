import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { RawPostsService } from '@/raw-posts/service/raw-posts-service';

import { GetRawPostsRequest } from '../requests';
import { GetRawPostsResponse } from '../responses';

@Injectable()
export class GetRawPostsHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly rawPostsService: RawPostsService,
  ) {}

  async handle(request: GetRawPostsRequest): Promise<GetRawPostsResponse> {
    const process = 'get-raw-posts';
    const processId = this.logger.startProcess(process, {
      userId: request.userId,
      offset: request.offset,
      limit: request.limit,
    });

    this.logger.logProcessProgress(processId, process, 'Fetching raw posts', {
      search: request.search,
      sort: request.sort,
    });

    const result = await this.rawPostsService.getRawPosts(
      {
        search: request.search,
        sort: request.sort,
        dateFrom: request.dateFrom,
        dateTo: request.dateTo,
        offset: request.offset,
        limit: request.limit,
      },
      { withSource: true },
    );

    this.logger.logProcessProgress(processId, process, 'Raw posts retrieved', {
      total: result.total,
      returned: result.data.length,
    });

    return result;
  }
}
