import { Module } from '@nestjs/common';

import { SourcesRepository } from './abstracts';
import { DrizzleSourcesRepository } from './sources-storage';

import { SourcesCollectorService } from './sources-collector-service';

import {
  ApiSourceCollectorStrategy,
  RssSourceCollectorStrategy,
  ScraperSourceCollectorStrategy,
} from './sources-collector-service/strategies';
import { CollectorStrategy } from './sources-collector-service/interfaces';
import { SourceCollectorsFactory } from './sources-collector-service/factories';

import { TelegramApiSourceCollectorStrategy } from './sources-collector-service/strategies/api-source-collector/strategies';
import { AvailableApiSourceCollectorStrategy } from './sources-collector-service/strategies/api-source-collector/interfaces';
import { AvailableApiSourceCollectorsFactory } from './sources-collector-service/strategies/api-source-collector/factories';

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

const services = [SourcesCollectorService];

@Module({
  imports: [],
  providers: [
    ...repositories,
    ...sourceCollectorsStrategies,
    ...factories,
    ...services,
  ],
  exports: [...services],
})
export class ServiceModule {}
