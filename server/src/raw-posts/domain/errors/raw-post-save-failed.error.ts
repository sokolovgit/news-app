import { AppError } from '@/errors';
import { HttpStatus } from '@nestjs/common';

export class RawPostSaveFailedError extends AppError {
  constructor(externalId: string, context?: string) {
    super(
      'Failed to save raw post',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
      {
        externalId,
      },
    );
  }
}
