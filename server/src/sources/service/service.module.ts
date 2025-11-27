import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PostsModule } from '@/posts/posts.module';
import { UserSourcesModule } from '@/user-sources';
import { UserActivityModule } from '@/user-activity/user-activity.module';
import { MediaModule } from '@/media';

import { SourcesRepository } from './abstracts';
import { DrizzleSourcesRepository } from './sources-storage';

import { SourcesService } from './sources-service';
import { SourcesValidationService } from './sources-validation';
import { SourcesPriorityCalculatorService } from './sources-priority-calculator';

import { TelegramService } from './telegram-serivce';
import { TelegramCollectorService } from './collectors';

import { SourceQueue } from '../domain/queues';
import { SourcesResultService } from './sources-result';
import { SourcesResultQueueService } from './sources-result-queue';
import { SourcesOrchestratorService } from './sources-orchestrator';
import { SourcesOrchestratorQueueService } from './sources-orchestrator-queue';

import { SourcePriorityJobScheduler } from './init-job-schedulers';

const repositories = [
  {
    provide: SourcesRepository,
    useClass: DrizzleSourcesRepository,
  },
];

const services = [
  TelegramService,
  TelegramCollectorService,
  SourcesService,
  SourcesResultService,
  SourcesValidationService,
  SourcesOrchestratorService,
  SourcesPriorityCalculatorService,
];

const schedulers = [SourcePriorityJobScheduler];
const queueServices = [
  SourcesResultQueueService,
  SourcesOrchestratorQueueService,
];

const queues = [
  {
    name: SourceQueue.CALCULATE_SOURCE_PRIORITY,
  },
  {
    name: SourceQueue.ORCHESTRATOR,
  },
  {
    name: SourceQueue.INSTAGRAM_FETCHER,
  },
  {
    name: SourceQueue.TELEGRAM_FETCHER,
  },
  {
    name: SourceQueue.FETCH_RESULTS,
  },
];

@Module({
  imports: [
    PostsModule,
    UserSourcesModule,
    UserActivityModule,
    MediaModule,
    BullModule.registerQueue(...queues),
  ],
  providers: [...repositories, ...schedulers, ...services, ...queueServices],
  exports: [...services],
})
export class ServiceModule {}
