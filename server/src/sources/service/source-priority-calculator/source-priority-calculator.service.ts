import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { SourcesService } from '../sources-service';
import { UserActivityService } from '@/user-activity/services';

import { Source } from '@/sources/domain/entities';
import { createPaginationParams } from '@/commons/types';

const MINUTE_IN_MS = 60 * 1000;
const ACTIVE_WINDOW_SECONDS = 5 * MINUTE_IN_MS; // 5 minutes
const BATCH_SIZE = 50; // Process sources in batches

@Injectable()
export class SourcePriorityCalculatorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly userActivityService: UserActivityService,
    private readonly sourcesService: SourcesService,
  ) {}

  /**
   * Calculate priorities for all sources based on active users
   * Fetches and processes sources in batches until all sources are processed
   */
  async calculateAndQueueSourcePriorities(): Promise<void> {
    this.logger.log('Starting source priority calculation');

    let offset = 0;
    let processedCount = 0;
    let hasMore = true;

    // Fetch and process sources in batches until all are processed
    while (hasMore) {
      const paginationParams = createPaginationParams({
        offset,
        limit: BATCH_SIZE,
      });

      const result =
        await this.sourcesService.findAllPaginated(paginationParams);

      if (result.data.length === 0) {
        hasMore = false;
        break;
      }

      await this.processBatch(result.data);
      processedCount += result.data.length;
      offset += BATCH_SIZE;

      this.logger.debug(
        `Processed batch: ${processedCount}/${result.total} sources (batch size: ${result.data.length})`,
      );

      // Use hasMore from pagination result
      hasMore = result.hasMore;
    }

    this.logger.log(
      `Completed priority calculation for ${processedCount} sources`,
    );
  }

  private async processBatch(sources: Source[]): Promise<void> {
    const promises = sources.map(async (source) => {
      const sourceId = source.getId();
      const activeUsers =
        await this.userActivityService.countActiveUsersInTimeWindow(
          sourceId,
          ACTIVE_WINDOW_SECONDS,
        );

      const priority = this.calculatePriority(activeUsers);

      this.logger.debug(
        `Source ${sourceId}: ${activeUsers} active users, priority ${priority}`,
      );
    });

    await Promise.all(promises);
  }

  private calculatePriority(activeFollowers: number): number {
    if (activeFollowers >= 100) return 1;
    if (activeFollowers >= 50) return 2;
    if (activeFollowers >= 20) return 3;
    if (activeFollowers >= 10) return 4;
    if (activeFollowers >= 5) return 5;
    if (activeFollowers >= 2) return 6;
    if (activeFollowers >= 1) return 7;
    return 10;
  }

  private calculateInterval(activeFollowers: number): number {
    if (activeFollowers >= 100) return 3 * MINUTE_IN_MS;
    if (activeFollowers >= 50) return 5 * MINUTE_IN_MS;
    if (activeFollowers >= 20) return 10 * MINUTE_IN_MS;
    if (activeFollowers >= 10) return 15 * MINUTE_IN_MS;
    if (activeFollowers >= 5) return 30 * MINUTE_IN_MS;
    if (activeFollowers >= 2) return 60 * MINUTE_IN_MS;
    if (activeFollowers >= 1) return 120 * MINUTE_IN_MS;
    return 0;
  }
}
