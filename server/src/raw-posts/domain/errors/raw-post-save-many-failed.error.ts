import { AppError } from '@/errors';
import { HttpStatus } from '@nestjs/common';

export class RawPostSaveManyFailedError extends AppError {
  constructor(externalIds: string[], context?: string) {
    super(
      'Failed to save many raw posts',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
      {
        externalIds,
      },
    );
  }
}
