import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/errors';
import { UserId } from '@/users/domain/schemas';

export class FailedToVerifyEmailError extends AppError {
  constructor(userId: UserId, context?: string) {
    super(
      `Failed to verify email for user ${userId}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
    );
  }
}
