import { AppError } from '@/errors';
import { HttpStatus } from '@nestjs/common';

export class UnauthorizedArticleAccessError extends AppError {
  constructor(articleId: string, userId: string, context?: string) {
    super(
      'You do not have permission to access this article',
      HttpStatus.FORBIDDEN,
      context,
      {
        articleId,
        userId,
      },
    );
  }
}
