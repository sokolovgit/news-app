import { Injectable } from '@nestjs/common';

import { Collector } from '@/sources/domain/enums';
import { CollectorStrategy } from '../interfaces';

@Injectable()
export class SourceCollectorsFactory {
  constructor(private readonly strategies: CollectorStrategy[]) {}

  getStrategy(collector: Collector): CollectorStrategy | undefined {
    return this.strategies.find((strategy) => strategy.supports(collector));
  }
}
