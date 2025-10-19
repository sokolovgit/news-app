import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/commons/errors';

/**
 * Thrown when token generation or signing fails.
 */
export class TokenGenerationFailedError extends AppError {
  constructor(userId: string, reason?: string, context?: string) {
    super(
      'Failed to generate authentication tokens',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
      { userId, reason },
    );
  }
}
