import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { PostsModule } from '@/posts/posts.module';
import { UserActivityModule } from '@/user-activity/user-activity.module';

import { DrizzleSourcesRepository } from './sources-storage';
import { SourcesRepository } from './abstracts';

import { SourcesService } from './sources-service';
import { UserSourcesModule } from '@/user-sources';
import { SourceValidationService } from './source-validation';
import { SourcesCollectorService } from './source-collector-service';
import { SourcePriorityCalculatorService } from './source-priority-calculator';

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
  SourcePriorityCalculatorService,
];

const schedulers = [SourcePriorityJobScheduler];

const queues = [
  {
    name: SourceQueue.CALCULATE_SOURCE_PRIORITY,
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
    ...sourceCollectorsStrategies,
    ...availableApiSourceCollectorsStrategies,
    ...factories,
  ],
  exports: [...services],
})
export class ServiceModule {}
