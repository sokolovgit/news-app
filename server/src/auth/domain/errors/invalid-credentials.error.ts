import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/commons/errors';

/**
 * Thrown when user provides invalid email or password during authentication.
 */
export class InvalidCredentialsError extends AppError {
  constructor(email?: string, context?: string) {
    super(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
      context,
      email ? { email } : {},
    );
  }
}
