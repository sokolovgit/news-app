import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/errors';

/**
 * Thrown when user creation fails at the database level.
 */
export class UserCreationFailedError extends AppError {
  constructor(email: string, reason?: string, context?: string) {
    super('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR, context, {
      email,
      reason,
    });
  }
}
