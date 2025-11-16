import { Injectable, NotImplementedException } from '@nestjs/common';

import { LoggerService } from '@/logger';

import { Source } from '@/sources/domain/entities';
import { Collector } from '@/sources/domain/enums';
import { CollectorStrategy } from '../interfaces';
import { ValidatedSourceUrl } from '@/sources/domain/types';

@Injectable()
export class ScraperSourceCollectorStrategy implements CollectorStrategy {
  constructor(private readonly logger: LoggerService) {}

  async collect(source: Source): Promise<void> {
    this.logger.log(`Collecting scraper source ${source.getId()}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new NotImplementedException('Not implemented');
  }

  async validate(validatedSourceUrl: ValidatedSourceUrl): Promise<boolean> {
    console.log('validating url', validatedSourceUrl.url);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new NotImplementedException('Not implemented');
  }

  supports(collector: Collector): boolean {
    return collector === Collector.SCRAPER;
  }

  getCollectorType(): Collector {
    return Collector.SCRAPER;
  }
}
