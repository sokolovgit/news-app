import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

import { OAuthService } from '@/auth/service/oauth/oauth-login.service';
import { CookiesService } from '@/cookies';
import { LoggerService } from '@/logger';

import { OAuthCallbackRequest } from '../requests';
import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';

@Injectable()
export class OAuthCallbackHandler {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly cookiesService: CookiesService,
    private readonly logger: LoggerService,
  ) {}

  async handle(
    request: OAuthCallbackRequest,
    response: Response,
  ): Promise<AuthenticationResult> {
    const { provider, code, error } = request;

    this.logger.debug(
      `Processing OAuth callback for provider: ${String(provider)}`,
    );

    if (error) {
      this.logger.debug(
        `OAuth callback error for provider ${String(provider)}: ${error}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!code) {
      this.logger.debug(
        `No authorization code received for provider: ${String(provider)}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.debug(
      `Authorization code received for provider: ${String(provider)}, processing login`,
    );

    const authenticationResult = await this.oauthService.oauthLogin(
      provider,
      code,
    );

    this.logger.debug(
      `OAuth login successful for provider ${String(provider)}, user ID: ${authenticationResult.user.getId()}`,
    );

    this.cookiesService.setRefreshTokenCookie(
      authenticationResult.tokens.plainRefreshToken,
      response,
    );

    this.logger.debug(
      `Refresh token cookie set for user ID: ${authenticationResult.user.getId()}`,
    );

    return authenticationResult;
  }
}
