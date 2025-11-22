import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { LoggerService } from '@/logger';
import { ConfigService } from '@/config';
import { SourceQueue } from '@/sources/domain/queues';

import {
  CreateErrorResultJobParams,
  CreateSuccessResultJobParams,
} from './types';
import { ResultJobData } from '../sources-result/types';

@Injectable()
export class SourcesResultQueueService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    @InjectQueue(SourceQueue.FETCH_RESULTS)
    private readonly resultsQueue: Queue<ResultJobData>,
  ) {}

  /**
   * Create success result job
   */
  async createSuccessResultJob(
    params: CreateSuccessResultJobParams,
  ): Promise<void> {
    this.logger.debug(
      `Creating success result job for source ${params.sourceId}`,
    );
    const resultJob: ResultJobData = {
      sourceId: params.sourceId,
      sourceType: params.sourceType,
      status: 'success',
      posts: params.posts,
      nextCursor: params.nextCursor,
      processingTime: params.processingTime,
      metadata: {
        collectorJobId: params.collectorJobId,
        orchestratorJobId: params.metadata.orchestratorJobId,
        fetchedAt: new Date(),
      },
    };

    await this.resultsQueue.add('process-result', resultJob, {
      priority: params.priority,
      ...this.configService.bullmq[SourceQueue.FETCH_RESULTS],
    });

    this.logger.debug(
      `Successfully created success result job for source ${params.sourceId}`,
    );
  }

  /**
   * Create error result job
   */
  async createErrorResultJob(
    params: CreateErrorResultJobParams,
  ): Promise<void> {
    this.logger.debug(
      `Creating error result job for source ${params.sourceId}`,
    );
    const resultJob: ResultJobData = {
      sourceId: params.sourceId,
      sourceType: params.sourceType,
      status: 'error',
      error: {
        code: this.getErrorCode(params.error),
        message: params.error.message,
        retryable: this.isRetryableError(params.error),
      },
      processingTime: params.processingTime,
      metadata: {
        collectorJobId: params.collectorJobId,
        orchestratorJobId: params.metadata.orchestratorJobId,
        fetchedAt: new Date(),
      },
    };

    await this.resultsQueue.add('process-result', resultJob, {
      priority: params.priority,
      ...this.configService.bullmq[SourceQueue.FETCH_RESULTS],
    });

    this.logger.debug(
      `Successfully created error result job for source ${params.sourceId}`,
    );
  }

  /**
   * Get error code based on error
   */
  private getErrorCode(error: Error): string {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('rate limit')) return 'RATE_LIMIT_ERROR';
    if (errorMessage.includes('not found')) return 'PROFILE_NOT_FOUND_ERROR';
    if (errorMessage.includes('authentication')) return 'AUTH_ERROR';
    if (errorMessage.includes('not connected'))
      return 'CLIENT_NOT_CONNECTED_ERROR';

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
