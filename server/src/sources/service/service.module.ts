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
import { SourcesFetchQueueService } from './sources-fetch-queue';
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
  SourcesCollectorService,
  SourcesValidationService,
  SourcesPriorityCalculatorService,
];

const queueServices = [SourcesFetchQueueService];

const schedulers = [SourcePriorityJobScheduler];

const queues = [
  {
    name: SourceQueue.CALCULATE_SOURCE_PRIORITY,
  },
  {
    name: SourceQueue.FETCH_SOURCE,
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
