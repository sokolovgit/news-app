import { Injectable, NotImplementedException } from '@nestjs/common';

import { LoggerService } from '@/logger';

import { Source } from '@/sources/domain/entities';
import { Collector } from '@/sources/domain/enums';
import { CollectorStrategy } from '../interfaces';
import { SourceToAvailableApiMatcher } from '../matchers';
import { AvailableApiSourceCollectorsFactory } from '../../api-source-collectors';
import {
  AvailableApiNotFoundError,
  AvailableApiSourceCollectorStrategyNotFoundError,
} from '@/sources/domain/errors';

@Injectable()
export class ApiSourceCollectorStrategy implements CollectorStrategy {
  constructor(
    private readonly logger: LoggerService,
    private readonly availableApiSourceCollectorFactory: AvailableApiSourceCollectorsFactory,
  ) {}

  async collect(source: Source): Promise<void> {
    this.logger.log(
      `Collecting source ${source.getId()} of type ${source.getCollector()}`,
    );
    const availableApi = SourceToAvailableApiMatcher.match(source);

    if (!availableApi) {
      this.logger.error(`Available API not found for source ${source.getId()}`);
      throw new AvailableApiNotFoundError(source);
    }

    this.logger.log(
      `Available API found for source ${source.getId()}: ${availableApi}`,
    );

    const apiStrategy =
      this.availableApiSourceCollectorFactory.getStrategy(availableApi);

    if (!apiStrategy) {
      this.logger.error(
        `API strategy not found for source ${source.getId()} and API ${availableApi}`,
      );
      throw new AvailableApiSourceCollectorStrategyNotFoundError(
        source,
        availableApi,
      );
    }

    this.logger.log(
      `API strategy found for source ${source.getId()}: ${apiStrategy.getApi()}`,
    );

    await apiStrategy.collect(source);
  }

  async validate(url: string): Promise<boolean> {
    console.log('validating url', url);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new NotImplementedException('Not implemented');
  }

  supports(collector: Collector): boolean {
    return collector === Collector.API;
  }

  getCollectorType(): Collector {
    return Collector.API;
  }
}
