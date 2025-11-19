import { Injectable } from '@nestjs/common';

import { ConfigService } from '@/config';
import { LoggerService } from '@/logger';
import { SourcesService } from '../sources-service';
import { UserActivityService } from '@/user-activity/services';
import { SourcesFetchQueueService } from '../sources-fetch-queue';

import { Source } from '@/sources/domain/entities';
import { SourcePriority } from './types/source-priority.type';
import { createPaginationParams } from '@/commons/types';

const MINUTE_IN_MILLIS = 60 * 1000;

const BATCH_SIZE = 50;
const PROCESS_NAME = 'calculate-source-priorities';

@Injectable()
export class SourcesPriorityCalculatorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly sourcesService: SourcesService,
    private readonly userActivityService: UserActivityService,
    private readonly sourcesFetchQueueService: SourcesFetchQueueService,
  ) {}

  /**
   * Calculate priorities for all sources based on active users
   * Fetches and processes sources in batches until all sources are processed
   */
  async calculateAndQueueSourcePriorities(): Promise<void> {
    const processId = this.logger.startProcess(PROCESS_NAME);

    let offset = 0;
    let processedCount = 0;
    let processedBatchCount = 0;
    let hasMore = true;

    // Fetch and process sources in batches until all are processed
    while (hasMore) {
      const paginationParams = createPaginationParams({
        offset,
        limit: BATCH_SIZE,
      });

      const result =
        await this.sourcesService.findAllPaginated(paginationParams);

      this.logger.logProcessProgress(
        processId,
        PROCESS_NAME,
        `Processing batch №${processedBatchCount} of total ${result.total} sources. Batch size: ${result.data.length}`,
      );

      if (result.data.length === 0) {
        hasMore = false;
        this.logger.logProcessProgress(
          processId,
          PROCESS_NAME,
          `No more sources to process`,
        );
        break;
      }

      await this.processBatch(result.data);
      processedCount += result.data.length;
      processedBatchCount++;
      offset += BATCH_SIZE;

      this.logger.logProcessProgress(
        processId,
        PROCESS_NAME,
        `Processed batch №${processedBatchCount} of total ${result.total} sources. Batch size: ${result.data.length}`,
      );

      // Use hasMore from pagination result
      hasMore = result.hasMore;

      if (hasMore) {
        this.logger.logProcessProgress(
          processId,
          PROCESS_NAME,
          `Has more sources to process`,
        );
      }
    }

    this.logger.log(
      `Completed priority calculation for ${processedCount} sources`,
    );
    this.logger.completeProcess(processId, PROCESS_NAME);
  }

  private async processBatch(sources: Source[]): Promise<void> {
    const promises = sources.map(async (source) => {
      const sourceId = source.getId();
      const activeUsers =
        await this.userActivityService.countActiveUsersInTimeWindowBySourceId(
          sourceId,
          this.configService.sources.activeWindowTimeInSeconds,
        );

      const priority = this.calculatePriority(activeUsers);
      const repeatInterval = this.calculateInterval(activeUsers);

      const sourcePriority: SourcePriority = {
        sourceId,
        sourceType: source.getSource(),
        collector: source.getCollector(),
        url: source.getUrl(),
        activeFollowers: activeUsers,
        priority,
        repeatInterval,
      };

      this.logger.debug(
        `Source ${sourceId}: ${activeUsers} active users, priority ${priority}, interval ${repeatInterval}ms`,
      );

      await this.sourcesFetchQueueService.scheduleSourceFetch(sourcePriority);
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
    if (activeFollowers >= 100) return 3 * MINUTE_IN_MILLIS;
    if (activeFollowers >= 50) return 5 * MINUTE_IN_MILLIS;
    if (activeFollowers >= 20) return 10 * MINUTE_IN_MILLIS;
    if (activeFollowers >= 10) return 15 * MINUTE_IN_MILLIS;
    if (activeFollowers >= 5) return 30 * MINUTE_IN_MILLIS;
    if (activeFollowers >= 2) return 60 * MINUTE_IN_MILLIS;
    if (activeFollowers >= 1) return 120 * MINUTE_IN_MILLIS;
    return 0;
  }
}
