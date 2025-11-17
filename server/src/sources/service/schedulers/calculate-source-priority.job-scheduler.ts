import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { ConfigService } from '@/config';
import { LoggerService } from '@/logger';

import { SourceQueue } from '@/sources/domain/queues';

@Injectable()
export class SourcePriorityJobScheduler implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    @InjectQueue(SourceQueue.CALCULATE_SOURCE_PRIORITY)
    private readonly calculateSourcePriorityQueue: Queue,
  ) {}

  async onModuleInit() {
    this.logger.log('Creating repeatable job for source priority calculation');
    await this.createRepeatableJob();
    this.logger.log('Repeatable job for source priority calculation created');
  }

  private async createRepeatableJob() {
    await this.calculateSourcePriorityQueue.add(
      SourceQueue.CALCULATE_SOURCE_PRIORITY,
      null,
      {
        ...this.configService.bullmq[SourceQueue.CALCULATE_SOURCE_PRIORITY],
      },
    );
  }
}
