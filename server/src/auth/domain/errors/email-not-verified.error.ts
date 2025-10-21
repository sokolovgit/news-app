import { AppError } from '@/errors';
import { HttpStatus } from '@nestjs/common';

export class EmailNotVerifiedError extends AppError {
  constructor(reason?: string, context?: string) {
    super(
      'Email is not verified',
      HttpStatus.FORBIDDEN,
      context,
      reason ? { reason } : {},
    );
  }
}
