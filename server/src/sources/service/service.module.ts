import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PostsModule } from '@/posts/posts.module';
import { UserActivityModule } from '@/user-activity/user-activity.module';

import { DrizzleSourcesRepository } from './sources-storage';
import { SourcesRepository } from './abstracts';

import { SourcesService } from './sources-service';
import { UserSourcesModule } from '@/user-sources';
import { SourcesValidationService } from './sources-validation';
import { SourcesCollectorService } from './sources-collector-service';
import { SourcesPriorityCalculatorService } from './sources-priority-calculator';

import { TelegramService } from './telegram-serivce';

import {
  CollectorStrategy,
  SourceCollectorsFactory,
  RssSourceCollectorStrategy,
  ScraperSourceCollectorStrategy,
} from './source-collectors';

import {
  ApiSourceCollectorStrategy,
  AvailableApiSourceCollectorsFactory,
  TelegramApiSourceCollectorStrategy,
  AvailableApiSourceCollectorStrategy,
} from './api-source-collectors';

import { SourceQueue } from '../domain/queues';
import { SourcePriorityJobScheduler } from './init-job-schedulers';
import { SourcesOrchestratorQueueService } from './sources-orchestrator-queue';
import { SourcesOrchestratorService } from './sources-orchestrator';
import { SourcesResultService } from './sources-result';
import { SourcesCollectorQueueService } from './sources-collector-queue';

const repositories = [
  {
    provide: SourcesRepository,
    useClass: DrizzleSourcesRepository,
  },
];

const sourceCollectorsStrategies = [
  ApiSourceCollectorStrategy,
  RssSourceCollectorStrategy,
  ScraperSourceCollectorStrategy,
];

const availableApiSourceCollectorsStrategies = [
  TelegramApiSourceCollectorStrategy,
];

const factories = [
  {
    provide: SourceCollectorsFactory,
    inject: [...sourceCollectorsStrategies],
    useFactory: (...strategies: CollectorStrategy[]) =>
      new SourceCollectorsFactory(strategies),
  },
  {
    provide: AvailableApiSourceCollectorsFactory,
    inject: [...availableApiSourceCollectorsStrategies],
    useFactory: (...strategies: AvailableApiSourceCollectorStrategy[]) =>
      new AvailableApiSourceCollectorsFactory(strategies),
  },
];

const services = [
  TelegramService,
  SourcesService,
  SourcesResultService,
  SourcesCollectorService,
  SourcesCollectorQueueService,
  SourcesValidationService,
  SourcesOrchestratorService,
  SourcesPriorityCalculatorService,
];

const schedulers = [SourcePriorityJobScheduler];
const queueServices = [SourcesOrchestratorQueueService];

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
    name: SourceQueue.TWITTER_FETCHER,
  },
  {
    name: SourceQueue.TELEGRAM_FETCHER,
  },
  {
    name: SourceQueue.RSS_FETCHER,
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
    BullModule.registerQueue(...queues),
  ],
  providers: [
    ...repositories,
    ...schedulers,
    ...services,
    ...queueServices,
    ...sourceCollectorsStrategies,
    ...availableApiSourceCollectorsStrategies,
    ...factories,
  ],
  exports: [...services],
})
export class ServiceModule {}
