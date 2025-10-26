import { Injectable } from '@nestjs/common';

import { AvailableApi } from '@/sources/domain/enums';
import { AvailableApiSourceCollectorStrategy } from '../interfaces';

@Injectable()
export class AvailableApiSourceCollectorsFactory {
  constructor(
    private readonly strategies: AvailableApiSourceCollectorStrategy[],
  ) {}

  getStrategy(
    api: AvailableApi,
  ): AvailableApiSourceCollectorStrategy | undefined {
    return this.strategies.find((strategy) => strategy.supports(api));
  }
}
