import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/commons/errors';

/**
 * Thrown when refresh token is invalid, expired, or not found.
 */
export class InvalidRefreshTokenError extends AppError {
  constructor(reason?: string, context?: string) {
    super(
      'Invalid or expired refresh token',
      HttpStatus.UNAUTHORIZED,
      context,
      reason ? { reason } : {},
    );
  }
}
