import { HttpStatus } from '@nestjs/common';

import { Source } from '../entities';
import { AppError } from '@/errors';
import { AvailableApi } from '../enums';

export class AvailableApiSourceCollectorStrategyNotFoundError extends AppError {
  constructor(source: Source, api: AvailableApi, context?: string) {
    super(
      'Available api source collector strategy not found',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
      {
        sourceId: source.getId(),
        collector: source.getCollector(),
        api,
      },
    );
  }
}
