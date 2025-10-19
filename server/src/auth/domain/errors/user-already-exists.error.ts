import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/commons/errors';

/**
 * Thrown when attempting to register a user with an email that already exists.
 */
export class UserAlreadyExistsError extends AppError {
  constructor(email: string, context?: string) {
    super(
      'A user with this email already exists',
      HttpStatus.CONFLICT,
      context,
      { email },
    );
  }
}
