import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/errors';

/**
 * Thrown when a user tries to login with password but account was created via OAuth.
 */
export class OAuthAccountRequiredError extends AppError {
  constructor(email: string, context?: string) {
    super(
      'This account was created via OAuth. Please use OAuth provider to login, or set a password.',
      HttpStatus.UNAUTHORIZED,
      context,
      { email },
    );
  }
}
