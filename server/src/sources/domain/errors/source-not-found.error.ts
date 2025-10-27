import { AppError } from '@/errors';
import { SourceId } from '../schemas';
import { HttpStatus } from '@nestjs/common';

export class SourceNotFoundError extends AppError {
  constructor(sourceId: SourceId, context?: string) {
    super(
      `Source not found with ID: ${sourceId}`,
      HttpStatus.NOT_FOUND,
      context,
      {
        sourceId,
      },
    );
  }
}
