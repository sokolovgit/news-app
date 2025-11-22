import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { LoggerService } from '@/logger';
import { SourcesRepository } from '@/sources/service/abstracts';
import { SourcesCollectorService } from '@/sources/service/sources-collector-service';
import { SourceQueue } from '@/sources/domain/queues';
import { CollectorJobData } from '@/sources/service/sources-orchestrator/types';
import {
  ResultJobData,
  FetchedPost,
} from '@/sources/service/sources-result/types';

@Injectable()
export class SourcesCollectorQueueService {
  constructor(
    private readonly logger: LoggerService,
    private readonly sourcesRepository: SourcesRepository,
    private readonly sourcesCollectorService: SourcesCollectorService,
    @InjectQueue(SourceQueue.FETCH_RESULTS)
    private readonly resultsQueue: Queue<ResultJobData>,
  ) {}

  /**
   * Process collector job: fetch posts using collector service and create result job
   */
  async processCollectorJob(
    collectorJobData: CollectorJobData,
    collectorJobId: string,
  ): Promise<void> {
    const { sourceId, sourceType, metadata, priority } = collectorJobData;
    const startTime = Date.now();

    this.logger.debug(
      `Processing collector job ${collectorJobId} for source ${sourceId}, type=${sourceType}`,
    );

    try {
      // 1. Load source entity
      const source = await this.sourcesRepository.getSourceById(sourceId);
      if (!source) {
        throw new Error(`Source ${sourceId} not found`);
      }

      // 2. Use SourcesCollectorService with strategy pattern to fetch posts
      // This will use the appropriate strategy (RSS, API, Scraper) based on source.collector
      // Collectors now return posts instead of saving them directly
      const collectorResult =
        await this.sourcesCollectorService.collect(source);

      const processingTime = Date.now() - startTime;

      // 3. Create success result job with fetched posts
      // Result processor will handle storage, deduplication, and caching
      await this.createSuccessResultJob(
        sourceId,
        sourceType,
        metadata,
        collectorJobId,
        collectorResult.posts,
        collectorResult.nextCursor,
        processingTime,
        priority,
      );

      this.logger.debug(
        `Successfully processed collector job ${collectorJobId} for source ${sourceId}: ${collectorResult.posts.length} posts fetched in ${processingTime}ms`,
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorInstance =
        error instanceof Error ? error : new Error(String(error));

      this.logger.error(
        `Failed to process collector job ${collectorJobId} for source ${sourceId}: ${errorInstance.message}`,
        errorInstance.stack,
      );

      // Create error result job
      await this.createErrorResultJob(
        sourceId,
        sourceType,
        metadata,
        collectorJobId,
        errorInstance,
        processingTime,
        priority,
      );

      throw errorInstance;
    }
  }

  /**
   * Create success result job
   */
  private async createSuccessResultJob(
    sourceId: CollectorJobData['sourceId'],
    sourceType: CollectorJobData['sourceType'],
    metadata: CollectorJobData['metadata'],
    collectorJobId: string,
    posts: FetchedPost[],
    nextCursor: string | undefined,
    processingTime: number,
    priority: number,
  ): Promise<void> {
    const resultJob: ResultJobData = {
      sourceId,
      sourceType,
      status: 'success',
      posts,
      nextCursor,
      processingTime,
      metadata: {
        collectorJobId,
        orchestratorJobId: metadata.orchestratorJobId,
        fetchedAt: new Date(),
      },
    };

    await this.resultsQueue.add('process-result', resultJob, {
      priority,
    });
  }

  /**
   * Create error result job
   */
  private async createErrorResultJob(
    sourceId: CollectorJobData['sourceId'],
    sourceType: CollectorJobData['sourceType'],
    metadata: CollectorJobData['metadata'],
    collectorJobId: string,
    error: Error,
    processingTime: number,
    priority: number,
  ): Promise<void> {
    const resultJob: ResultJobData = {
      sourceId,
      sourceType,
      status: 'error',
      error: {
        code: this.getErrorCode(error, sourceType),
        message: error.message,
        retryable: this.isRetryableError(error),
      },
      processingTime,
      metadata: {
        collectorJobId,
        orchestratorJobId: metadata.orchestratorJobId,
        fetchedAt: new Date(),
      },
    };

    await this.resultsQueue.add('process-result', resultJob, {
      priority,
    });
  }

  /**
   * Get error code based on error and source type
   */
  private getErrorCode(error: Error, sourceType: string): string {
    const errorMessage = error.message.toLowerCase();

    // Common errors across all source types
    if (errorMessage.includes('rate limit')) return 'RATE_LIMIT_ERROR';
    if (errorMessage.includes('not found')) return 'PROFILE_NOT_FOUND_ERROR';
    if (errorMessage.includes('authentication')) return 'AUTH_ERROR';

    // Source-specific errors
    if (sourceType === 'instagram') {
      if (errorMessage.includes('private')) return 'PRIVATE_PROFILE_ERROR';
    }

    if (sourceType === 'twitter') {
      if (errorMessage.includes('suspended')) return 'ACCOUNT_SUSPENDED_ERROR';
    }

    return 'COLLECTION_ERROR';
  }

  /**
   * Determine if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      'rate limit',
      'timeout',
      'network',
      'connection',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'TimeoutError',
      'NetworkError',
      'ConnectionError',
    ];

    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    return (
      retryablePatterns.some((pattern) => errorMessage.includes(pattern)) ||
      retryablePatterns.some((pattern) => errorName.includes(pattern))
    );
  }
}
