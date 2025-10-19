import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/commons/errors';
import { OAuthProvider } from '../enums';

/**
 * Thrown when OAuth provider returns an error or fails to authenticate.
 */
export class OAuthProviderError extends AppError {
  constructor(provider: OAuthProvider, reason?: string, context?: string) {
    super(
      `OAuth authentication failed with ${provider}`,
      HttpStatus.BAD_REQUEST,
      context,
      { provider, reason },
    );
  }
}
