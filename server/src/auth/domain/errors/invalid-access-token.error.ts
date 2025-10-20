import { AppError } from '@/errors';
import { HttpStatus } from '@nestjs/common';

export class InvalidAccessTokenError extends AppError {
  constructor(reason?: string, context?: string) {
    super(
      'Invalid or expired access token',
      HttpStatus.UNAUTHORIZED,
      context,
      reason ? { reason } : {},
    );
  }
}
