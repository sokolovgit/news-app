import { HttpStatus } from '@nestjs/common';

import { Source } from '../entities';
import { AppError } from '@/errors';

export class SourceCollectorStrategyNotFoundError extends AppError {
  constructor(source: Source, context?: string) {
    super(
      'Source collector strategy not found',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
      {
        sourceId: source.getId(),
        collector: source.getCollector(),
      },
    );
  }
}
