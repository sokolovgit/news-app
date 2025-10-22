import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/errors';

/**
 * Thrown when a user cannot be found by ID or email.
 */
export class UserNotFoundError extends AppError {
  constructor(
    identifier: string,
    identifierType: 'id' | 'email' = 'id',
    context?: string,
  ) {
    super('User not found', HttpStatus.NOT_FOUND, context, {
      [identifierType]: identifier,
    });
  }
}
