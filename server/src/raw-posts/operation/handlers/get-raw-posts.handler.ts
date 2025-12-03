import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { RawPostsService } from '@/raw-posts/service/raw-posts-service';
import { UserSourcesService } from '@/user-sources';
import { createPaginatedResult } from '@/commons/types';

import { GetRawPostsRequest } from '../requests';
import { GetRawPostsResponse } from '../responses';

@Injectable()
export class GetRawPostsHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly rawPostsService: RawPostsService,
    private readonly userSourcesService: UserSourcesService,
  ) {}

  async handle(request: GetRawPostsRequest): Promise<GetRawPostsResponse> {
    const process = 'get-raw-posts';
    const processId = this.logger.startProcess(process, {
      userId: request.userId,
      offset: request.offset,
      limit: request.limit,
    });

    // If sourceIds is not provided, filter by user's subscribed sources
    let sourceIds = request.sourceIds;
    if (!sourceIds || sourceIds.length === 0) {
      const userSubscribedSourceIds =
        await this.userSourcesService.getAllSourceIdsByUser(request.userId);

      // If user has no subscriptions, return empty result
      if (userSubscribedSourceIds.length === 0) {
        this.logger.logProcessProgress(
          processId,
          process,
          'User has no subscribed sources, returning empty result',
        );
        return createPaginatedResult(
          [],
          0,
          {
            offset: request.offset,
            limit: request.limit,
          },
        );
      }

      sourceIds = userSubscribedSourceIds;
      this.logger.logProcessProgress(processId, process, 'Filtering by user subscriptions', {
        subscribedSourceCount: sourceIds.length,
      });
    }

    this.logger.logProcessProgress(processId, process, 'Fetching raw posts', {
      search: request.search,
      sort: request.sort,
      sourceIds,
    });

    const result = await this.rawPostsService.getRawPosts(
      {
        search: request.search,
        sort: request.sort,
        dateFrom: request.dateFrom,
        dateTo: request.dateTo,
        offset: request.offset,
        limit: request.limit,
        sourceIds,
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
