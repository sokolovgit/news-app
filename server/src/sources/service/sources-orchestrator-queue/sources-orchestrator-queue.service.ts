import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';

import { ConfigService } from '@/config';
import { LoggerService } from '@/logger';

import { SourceId } from '@/sources/domain/schemas';
import { SourceQueue } from '@/sources/domain/queues';
import { OrchestratorJobData } from './types';

@Injectable()
export class SourcesOrchestratorQueueService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    @InjectQueue(SourceQueue.ORCHESTRATOR)
    private readonly orchestratorQueue: Queue<OrchestratorJobData>,
  ) {}

  /**
   * Schedule or update a repeatable job for source fetching based on priority
   * Called by SourcePriorityCalculatorService when calculating priorities
   */
  async scheduleSourceFetch(
    sourceId: SourceId,
    priority: number,
    repeatInterval: number,
  ): Promise<void> {
    const schedulerId = this.getSchedulerId(sourceId);

    // If no active followers, remove the job scheduler
    if (repeatInterval === 0) {
      await this.removeJobScheduler(schedulerId);
      return;
    }

    // Create job data
    const jobData: OrchestratorJobData = {
      sourceId,
      priority,
      scheduledBy: 'cron',
    };

    const queueConfig = this.configService.bullmq[SourceQueue.ORCHESTRATOR];

    // Upsert job scheduler (creates or updates existing scheduler)
    await this.orchestratorQueue.upsertJobScheduler(
      schedulerId,
      {
        every: repeatInterval,
      },
      {
        name: 'orchestrate-source-fetch',
        data: jobData,
        opts: {
          priority,
          ...queueConfig,
        },
      },
    );

    this.logger.debug(
      `Scheduled orchestrator job for source ${sourceId}: schedulerId=${schedulerId}, priority=${priority}, interval=${repeatInterval}ms`,
    );
  }

  /**
   * Add a one-time job for manual source fetch trigger
   * Used when user manually triggers a fetch or when cache expires
   */
  async addManualFetchJob(
    sourceId: SourceId,
    options?: {
      userId?: string;
      delay?: number;
    },
  ): Promise<void> {
    const jobData: OrchestratorJobData = {
      sourceId,
      priority: this.configService.bullmq.highPriority,
      scheduledBy: 'user',
      metadata: {
        userId: options?.userId,
        triggerReason: 'manual',
      },
    };

    const jobOptions: JobsOptions = {
      priority: this.configService.bullmq.highPriority,
      delay: options?.delay,
      ...this.configService.bullmq[SourceQueue.ORCHESTRATOR],
    };

    const job = await this.orchestratorQueue.add(
      'orchestrate-source-fetch',
      jobData,
      jobOptions,
    );

    this.logger.debug(
      `Added manual orchestrator job for source ${sourceId}: jobId=${job.id}, priority=${jobOptions.priority}`,
    );
  }

  /**
   * Remove a job scheduler for a source
   */
  private async removeJobScheduler(schedulerId: string): Promise<void> {
    try {
      await this.orchestratorQueue.removeJobScheduler(schedulerId);
      this.logger.debug(`Removed orchestrator job scheduler ${schedulerId}`);
    } catch {
      // Scheduler might not exist, which is fine
      this.logger.debug(
        `Orchestrator job scheduler ${schedulerId} not found or already removed`,
      );
    }
  }

  /**
   * Get unique scheduler ID for a source
   */
  private getSchedulerId(sourceId: SourceId): string {
    return `source-orchestrator-${sourceId}-scheduler`;
  }
}
