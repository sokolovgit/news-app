import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { SourceCollectorsFactory } from '../source-collectors';

import { Source } from '@/sources/domain/entities';
import { SourceCollectorStrategyNotFoundError } from '@/sources/domain/errors';
import { CollectorResult } from './types';

@Injectable()
export class SourcesCollectorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly sourceCollectorsFactory: SourceCollectorsFactory,
  ) {}

  async collect(source: Source): Promise<CollectorResult> {
    this.logger.log(`Collecting source ${source.toString()}`);

    const collector = source.getCollector();

    const strategy = this.sourceCollectorsFactory.getStrategy(collector);

    if (!strategy) {
      this.logger.error(
        `Source collector strategy not found for source ${source.getId()}`,
      );
      throw new SourceCollectorStrategyNotFoundError(source);
    }

    this.logger.log(
      `Strategy found for source ${source.getId()}: ${strategy.getCollectorType()}`,
    );

    return await strategy.collect(source);
  }
}
