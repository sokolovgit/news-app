import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';

import { ConfigService } from '@/config';
import { LoggerService } from '@/logger';

import { SourceId } from '@/sources/domain/schemas';
import { PublicSource } from '@/sources/domain/enums';
import { SourceQueue } from '@/sources/domain/queues';
import { SourcePriority } from '../sources-priority-calculator/types';
import { SourceFetchJobData, AddManualFetchJobParams } from './types';

@Injectable()
export class SourcesFetchQueueService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    @InjectQueue(SourceQueue.FETCH_SOURCE)
    private readonly fetchSourceQueue: Queue<SourceFetchJobData>,
  ) {}

  /**
   * Schedule or update a repeatable job for source fetching based on priority
   * Called by SourcePriorityCalculatorService when calculating priorities
   */
  async scheduleSourceFetch(sourcePriority: SourcePriority): Promise<void> {
    const { sourceId, sourceType, collector, url, priority, repeatInterval } =
      sourcePriority;

    const schedulerId = this.getSchedulerId(sourceId);

    // If no active followers, remove the job scheduler
    if (repeatInterval === 0) {
      await this.removeJobScheduler(schedulerId);
      return;
    }

    // Create or update job scheduler
    const jobName = this.getJobName(sourceType);
    const jobData: SourceFetchJobData = {
      sourceId,
      sourceType,
      collector,
      url,
      scheduledBy: 'cron',
    };

    const queueConfig = this.configService.bullmq[SourceQueue.FETCH_SOURCE];

    // Upsert job scheduler (creates or updates existing scheduler)
    await this.fetchSourceQueue.upsertJobScheduler(
      schedulerId,
      {
        every: repeatInterval,
      },
      {
        name: jobName,
        data: jobData,
        opts: {
          priority,
          ...queueConfig,
        },
      },
    );

    this.logger.debug(
      `Scheduled job scheduler for source ${sourceId}: schedulerId=${schedulerId}, priority=${priority}, interval=${repeatInterval}ms`,
    );
  }

  /**
   * Add a one-time job for manual source fetch trigger
   * Used when user manually triggers a fetch or when cache expires
   */
  async addManualFetchJob(params: AddManualFetchJobParams): Promise<void> {
    const { sourceId, sourceType, collector, url, options } = params;
    const jobName = this.getJobName(sourceType);
    const jobData: SourceFetchJobData = {
      sourceId,
      sourceType,
      collector,
      url,
      scheduledBy: 'user',
      userId: options?.userId,
    };

    const jobOptions: JobsOptions = {
      priority: this.configService.bullmq.highPriority,
      delay: options?.delay,
      ...this.configService.bullmq[SourceQueue.FETCH_SOURCE],
    };

    const job = await this.fetchSourceQueue.add(jobName, jobData, jobOptions);

    this.logger.debug(
      `Added manual fetch job for source ${sourceId}: jobId=${job.id}, priority=${jobOptions.priority}`,
    );
  }

  /**
   * Remove a job scheduler for a source
   */
  private async removeJobScheduler(schedulerId: string): Promise<void> {
    try {
      await this.fetchSourceQueue.removeJobScheduler(schedulerId);
      this.logger.debug(`Removed job scheduler ${schedulerId}`);
    } catch {
      // Scheduler might not exist, which is fine
      this.logger.debug(
        `Job scheduler ${schedulerId} not found or already removed`,
      );
    }
  }

  /**
   * Get unique scheduler ID for a source
   */
  private getSchedulerId(sourceId: SourceId): string {
    return `source-fetch-${sourceId}-scheduler`;
  }

  /**
   * Get job name based on source type
   */
  private getJobName(sourceType: PublicSource): string {
    return `source-fetch-${sourceType}`;
  }
}
