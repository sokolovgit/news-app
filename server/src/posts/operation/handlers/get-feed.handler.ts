import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { RawPostsService } from '@/posts/service/raw-posts-service';
import { UserSourcesService } from '@/user-sources';

import { GetFeedRequest } from '../requests';
import { GetFeedResponse } from '../responses';

@Injectable()
export class GetFeedHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly rawPostsService: RawPostsService,
    private readonly userSourcesService: UserSourcesService,
  ) {}

  async handle(request: GetFeedRequest): Promise<GetFeedResponse> {
    const process = 'get-feed';
    const processId = this.logger.startProcess(process, {
      userId: request.userId,
      offset: request.offset,
      limit: request.limit,
    });

    this.logger.logProcessProgress(
      processId,
      process,
      'Getting user source IDs',
      { userId: request.userId },
    );

    // Get all source IDs for the user
    const userSourceIds = await this.userSourcesService.getAllSourceIdsByUser(
      request.userId,
    );

    if (!userSourceIds.length) {
      this.logger.logProcessProgress(
        processId,
        process,
        'No sources found for user',
        { userId: request.userId },
      );

      return {
        data: [],
        total: 0,
        offset: request.offset,
        limit: request.limit,
        hasMore: false,
      };
    }

    // Filter by requested source IDs if provided
    const sourceIds = request.sourceIds
      ? request.sourceIds.filter((id) => userSourceIds.includes(id))
      : userSourceIds;

    if (!sourceIds.length) {
      this.logger.logProcessProgress(
        processId,
        process,
        'No matching sources found',
        { userId: request.userId, requestedSourceIds: request.sourceIds },
      );

      return {
        data: [],
        total: 0,
        offset: request.offset,
        limit: request.limit,
        hasMore: false,
      };
    }

    this.logger.logProcessProgress(
      processId,
      process,
      'Fetching posts from repository',
      {
        sourceIds: sourceIds.length,
        search: request.search,
        sort: request.sort,
      },
    );

    const result = await this.rawPostsService.getFeedPosts(
      {
        sourceIds,
        search: request.search,
        sort: request.sort,
        dateFrom: request.dateFrom,
        dateTo: request.dateTo,
        offset: request.offset,
        limit: request.limit,
      },
      { withSource: true },
    );

    this.logger.logProcessProgress(processId, process, 'Feed retrieved', {
      total: result.total,
      returned: result.data.length,
    });

    return result;
  }
}
