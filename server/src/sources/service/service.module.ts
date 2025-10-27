import { Module } from '@nestjs/common';

import { SourcesRepository } from './abstracts';
import { DrizzleSourcesRepository } from './sources-storage';

import { SourcesCollectorService } from './source-collector-service';

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

import { TelegramService } from './telegram-serivce';

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

const services = [SourcesCollectorService, TelegramService];

@Module({
  imports: [],
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
