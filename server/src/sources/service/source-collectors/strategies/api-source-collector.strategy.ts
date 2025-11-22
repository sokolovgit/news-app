import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';

import { Source } from '@/sources/domain/entities';
import { Collector } from '@/sources/domain/enums';
import { CollectorStrategy } from '../interfaces';
import { SourceToAvailableApiMatcher } from '../matchers';
import { AvailableApiSourceCollectorsFactory } from '../../api-source-collectors';
import {
  AvailableApiNotFoundError,
  AvailableApiSourceCollectorStrategyNotFoundError,
  InvalidSourceUrlError,
} from '@/sources/domain/errors';
import { ValidatedSourceUrl } from '@/sources/domain/types';
import { CollectorResult } from '../../sources-collector-service/types';

@Injectable()
export class ApiSourceCollectorStrategy implements CollectorStrategy {
  constructor(
    private readonly logger: LoggerService,
    private readonly availableApiSourceCollectorFactory: AvailableApiSourceCollectorsFactory,
  ) {}

  async collect(source: Source): Promise<CollectorResult> {
    this.logger.log(
      `Collecting source ${source.getId()} of type ${source.getCollector()}`,
    );
    const availableApi = SourceToAvailableApiMatcher.match(source.getSource());

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

    return await apiStrategy.collect(source);
  }

  async validate(validatedSourceUrl: ValidatedSourceUrl): Promise<boolean> {
    this.logger.log(
      `Validating API source ${validatedSourceUrl.url} with collector ${validatedSourceUrl.collector}`,
    );

    const availableApi = SourceToAvailableApiMatcher.match(
      validatedSourceUrl.source,
    );

    if (!availableApi) {
      this.logger.error(
        `Available API not found for source ${validatedSourceUrl.source}`,
      );
      throw new InvalidSourceUrlError(
        validatedSourceUrl.url,
        `Available API not found for source type ${validatedSourceUrl.source}`,
      );
    }

    const apiStrategy =
      this.availableApiSourceCollectorFactory.getStrategy(availableApi);

    if (!apiStrategy) {
      this.logger.error(
        `API strategy not found for source ${validatedSourceUrl.source} and API ${availableApi}`,
      );
      throw new InvalidSourceUrlError(
        validatedSourceUrl.url,
        `API strategy not found for source type ${validatedSourceUrl.source} and API ${availableApi}`,
      );
    }

    const isValid = await apiStrategy.validate(validatedSourceUrl.url);

    if (!isValid) {
      throw new InvalidSourceUrlError(
        validatedSourceUrl.url,
        `Invalid source URL for source type ${validatedSourceUrl.source} and API ${availableApi}`,
      );
    }

    return true;
  }

  supports(collector: Collector): boolean {
    return collector === Collector.API;
  }

  getCollectorType(): Collector {
    return Collector.API;
  }
}
