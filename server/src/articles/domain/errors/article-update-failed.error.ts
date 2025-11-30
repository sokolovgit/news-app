import { AppError } from '@/errors';
import { HttpStatus } from '@nestjs/common';

export class ArticleUpdateFailedError extends AppError {
  constructor(articleId: string, context?: string) {
    super(
      'Failed to update article',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
      {
        articleId,
      },
    );
  }
}
