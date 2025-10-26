import { Injectable, NotImplementedException } from '@nestjs/common';

import { Source } from '@/sources/domain/entities';
import { Collector } from '@/sources/domain/enums';
import { CollectorStrategy } from '../../interfaces';

@Injectable()
export class ApiSourceCollectorStrategy implements CollectorStrategy {
  constructor() {}

  async collect(source: Source): Promise<void> {
    console.log('collecting source', source);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    throw new NotImplementedException('Not implemented');
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
