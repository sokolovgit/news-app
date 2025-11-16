import { Module } from '@nestjs/common';
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

@Module({
  imports: [PostsModule],
  providers: [
    ...repositories,
    ...services,
    ...sourceCollectorsStrategies,
    ...availableApiSourceCollectorsStrategies,
    ...factories,
  ],
  exports: [...services],
})
export class ServiceModule {}
