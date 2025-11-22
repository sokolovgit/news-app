import { Injectable } from '@nestjs/common';
import { Api } from 'telegram';

import { LoggerService } from '@/logger';
import { SourcesService } from '../sources-service';
import { TelegramService } from '../telegram-serivce';
import { CollectorService } from './interfaces/collector-service.interface';

import { FetchedPost } from '../sources-result/types';
import { CollectorJobData } from '../sources-orchestrator/types';
import { SourceNotFoundError } from '@/sources/domain/errors';
import { SourcesResultQueueService } from '../sources-result-queue';
import { TelegramMessageToFetchedPostMapper } from './mappers/telegram-message-to-fetched-post.mapper';

@Injectable()
export class TelegramCollectorService implements CollectorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly sourcesService: SourcesService,
    private readonly telegramService: TelegramService,
    private readonly resultsQueueService: SourcesResultQueueService,
  ) {}

  /**
   * Process a collector job: fetch posts and create result job
   */
  async processJob(
    jobData: CollectorJobData,
    collectorJobId: string,
    startTime: number,
  ): Promise<void> {
    const { sourceId, sourceType, metadata, priority, limit } = jobData;

    try {
      // 1. Load source entity
      const source = await this.sourcesService.getSourceById(sourceId);
      if (!source) {
        throw new SourceNotFoundError(sourceId);
      }

      this.logger.log(
        `Collecting Telegram source ${sourceId}, limit=${limit ?? 50}`,
      );

      // 2. Fetch messages from Telegram
      const messages = await this.telegramService.fetchChannelMessages(
        source.getUrl(),
        limit ?? 50,
      );

      // 3. Map Telegram messages to FetchedPost format
      const posts: FetchedPost[] = messages.map((message: Api.Message) =>
        TelegramMessageToFetchedPostMapper.toFetchedPost(message),
      );

      const processingTime = Date.now() - startTime;

      // 4. Create success result job
      await this.resultsQueueService.createSuccessResultJob({
        sourceId,
        sourceType,
        metadata,
        collectorJobId,
        posts,
        nextCursor: undefined, // Telegram doesn't use cursor-based pagination
        processingTime,
        priority,
      });

      this.logger.log(
        `Successfully processed Telegram collector job ${collectorJobId} for source ${sourceId}: ${posts.length} posts fetched in ${processingTime}ms`,
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorInstance =
        error instanceof Error ? error : new Error(String(error));

      this.logger.error(
        `Failed to process Telegram collector job ${collectorJobId} for source ${sourceId}: ${errorInstance.message}`,
        errorInstance.stack,
      );

      // Create error result job
      await this.resultsQueueService.createErrorResultJob({
        sourceId,
        sourceType,
        metadata,
        collectorJobId,
        error: errorInstance,
        processingTime,
        priority,
      });

      throw errorInstance; // Re-throw to trigger BullMQ retry
    }
  }
}
