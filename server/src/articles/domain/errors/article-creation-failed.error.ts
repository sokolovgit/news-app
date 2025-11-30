import { AppError } from '@/errors';
import { HttpStatus } from '@nestjs/common';

export class ArticleCreationFailedError extends AppError {
  constructor(context?: string) {
    super(
      'Failed to create article',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
    );
  }
}
