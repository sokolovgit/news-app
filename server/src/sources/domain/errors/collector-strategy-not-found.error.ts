import { HttpStatus } from '@nestjs/common';

import { AppError } from '@/errors';
import { Collector } from '../enums';

export class CollectorStrategyNotFoundError extends AppError {
  constructor(collector: Collector, context?: string) {
    super(
      'Source collector strategy not found',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
      {
        collector,
      },
    );
  }
}
