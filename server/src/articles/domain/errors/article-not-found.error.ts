import { AppError } from '@/errors';
import { HttpStatus } from '@nestjs/common';

export class ArticleNotFoundError extends AppError {
  constructor(articleId: string, context?: string) {
    super('Article not found', HttpStatus.NOT_FOUND, context, {
      articleId,
    });
  }
}
