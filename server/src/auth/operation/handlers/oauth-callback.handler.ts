import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

import { OAuthService } from '@/auth/service/oauth/oauth-login.service';
import { CookiesService } from '@/cookies';

import { OAuthCallbackRequest } from '../requests';
import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';

@Injectable()
export class OAuthCallbackHandler {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly cookiesService: CookiesService,
  ) {}

  async handle(
    request: OAuthCallbackRequest,
    response: Response,
  ): Promise<AuthenticationResult> {
    const { provider, code, error } = request;

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!code) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const authenticationResult = await this.oauthService.oauthLogin(
      provider,
      code,
    );

    this.cookiesService.setRefreshTokenCookie(
      authenticationResult.tokens.plainRefreshToken,
      response,
    );

    return authenticationResult;
  }
}
