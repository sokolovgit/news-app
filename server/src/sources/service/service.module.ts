import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PostsModule } from '@/posts/posts.module';

import { SourcesRepository, UserSourcesRepository } from './abstracts';
import { DrizzleSourcesRepository } from './sources-storage';
import { DrizzleUserSourcesRepository } from './user-sources-storage';

import { SourcesService } from './sources-service';
import { UserSourcesService } from './user-sources-service';
import { SourceValidationService } from './source-validation';
import { SourcesCollectorService } from './source-collector-service';

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
import { SourcePriorityJobScheduler } from './schedulers';

const repositories = [
  {
    provide: SourcesRepository,
    useClass: DrizzleSourcesRepository,
  },
  {
    provide: UserSourcesRepository,
    useClass: DrizzleUserSourcesRepository,
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
  SourcesService,
  SourcesCollectorService,
  TelegramService,
  SourceValidationService,
  UserSourcesService,
];

const schedulers = [SourcePriorityJobScheduler];

const queues = [
  {
    name: SourceQueue.CALCULATE_SOURCE_PRIORITY,
  },
];

@Module({
  imports: [PostsModule, BullModule.registerQueue(...queues)],
  providers: [
    ...repositories,
    ...schedulers,
    ...services,
    ...sourceCollectorsStrategies,
    ...availableApiSourceCollectorsStrategies,
    ...factories,
  ],
  exports: [...services],
})
export class ServiceModule {}
