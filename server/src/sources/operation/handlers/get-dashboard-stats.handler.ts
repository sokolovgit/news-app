import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { UserSourcesService } from '@/user-sources';
import { RawPostsService } from '@/raw-posts/service';
import { SourcesService } from '@/sources/service/sources-service';
import { SortOrder } from '@/commons/types';

import { GetDashboardStatsRequest } from '../requests';
import { GetDashboardStatsResponse } from '../responses';

@Injectable()
export class GetDashboardStatsHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly userSourcesService: UserSourcesService,
    private readonly rawPostsService: RawPostsService,
    private readonly sourcesService: SourcesService,
  ) {}

  async handle(
    request: GetDashboardStatsRequest,
  ): Promise<GetDashboardStatsResponse> {
    this.logger.log(
      `Handling get dashboard stats request for user ${request.userId}`,
    );

    // Get user's source IDs
    const sourceIds = await this.userSourcesService.getAllSourceIdsByUser(
      request.userId,
    );

    // Get total sources count
    const sourcesResult = await this.userSourcesService.getAllByUserPaginated(
      request.userId,
      { offset: 0, limit: 1 },
    );
    const totalSources = sourcesResult.total;

    // Calculate posts today (last 24 hours) - DB side calculation
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    let postsToday = 0;
    let lastUpdated: Date | null = null;

    if (sourceIds.length > 0) {
      // Get posts count from last 24 hours (DB calculates total)
      const postsCountResult = await this.rawPostsService.getRawPosts(
        {
          sourceIds,
          dateFrom: yesterday,
          offset: 0,
          limit: 1, // Only need count, not data
          sort: { field: 'createdAt', order: SortOrder.DESC },
        },
        { withSource: false },
      );

      postsToday = postsCountResult.total;

      // Get the most recent post date (DB calculates MAX of createdAt and updatedAt)
      const mostRecentPostDate =
        await this.rawPostsService.getMostRecentPostDate(sourceIds);

      // Get most recent source update (DB calculates MAX updatedAt)
      const sourceMaxUpdatedAt =
        await this.sourcesService.getMaxUpdatedAt(sourceIds);

      // Use the most recent between post and source update
      if (mostRecentPostDate && sourceMaxUpdatedAt) {
        lastUpdated =
          mostRecentPostDate > sourceMaxUpdatedAt
            ? mostRecentPostDate
            : sourceMaxUpdatedAt;
      } else {
        lastUpdated = mostRecentPostDate || sourceMaxUpdatedAt || null;
      }
    }

    return {
      totalSources,
      postsToday,
      lastUpdated: lastUpdated?.toISOString() || null,
    };
  }
}
