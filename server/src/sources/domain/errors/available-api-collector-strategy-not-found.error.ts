import { HttpStatus } from '@nestjs/common';

import { Source } from '../entities';
import { AppError } from '@/errors';

export class AvailableApiNotFoundError extends AppError {
  constructor(source: Source, context?: string) {
    super(
      'Available API not found for existing source',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
      {
        sourceId: source.getId(),
        sourceType: source.getSource(),
      },
    );
  }
}
