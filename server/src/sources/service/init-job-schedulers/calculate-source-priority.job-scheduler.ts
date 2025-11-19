import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { ConfigService } from '@/config';
import { LoggerService } from '@/logger';

import { SourceQueue } from '@/sources/domain/queues';
import { UpsertJobSchedulerConfig } from '@/commons/bullmq/types';

@Injectable()
export class SourcePriorityJobScheduler implements OnModuleInit {
  private readonly jobSchedulerConfig: UpsertJobSchedulerConfig<string, null>;
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    @InjectQueue(SourceQueue.CALCULATE_SOURCE_PRIORITY)
    private readonly calculateSourcePriorityQueue: Queue,
  ) {
    this.jobSchedulerConfig =
      this.configService.bullmq[SourceQueue.CALCULATE_SOURCE_PRIORITY];
  }

  async onModuleInit() {
    this.logger.log('Setting up source priority calculation scheduler');

    const existing = (
      await this.calculateSourcePriorityQueue.getJobSchedulers()
    ).find((s) => s.key === this.jobSchedulerConfig.jobSchedulerId);

    if (existing) {
      this.logger.log('Found existing scheduler, removing it');
      await this.removeJobScheduler();
    }

    this.logger.log('No existing scheduler found, creating new one');

    await this.upsertJobScheduler();

    await this.calculateSourcePriorityQueue.setGlobalConcurrency(1);

    this.logger.log(
      `Source priority scheduler is ready. Repeat interval: ${this.jobSchedulerConfig.repeatOptions.every}ms`,
    );
  }

  private async upsertJobScheduler() {
    await this.calculateSourcePriorityQueue.upsertJobScheduler(
      this.jobSchedulerConfig.jobSchedulerId,
      this.jobSchedulerConfig.repeatOptions,
      this.jobSchedulerConfig.template,
    );

    this.logger.log(
      `Scheduler created/updated: ${this.jobSchedulerConfig.jobSchedulerId}`,
    );
  }

  private async removeJobScheduler() {
    await this.calculateSourcePriorityQueue.removeJobScheduler(
      this.jobSchedulerConfig.jobSchedulerId,
    );

    this.logger.log('Scheduler removed');
  }
}
