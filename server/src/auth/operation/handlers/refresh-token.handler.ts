import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { CookiesService } from '@/commons/cookies';
import { TokensService } from '@/auth/service/tokens';

import { RefreshTokenRequest } from '../requests';
import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';

@Injectable()
export class RefreshTokenHandler {
  constructor(
    private readonly tokensService: TokensService,
    private readonly cookiesService: CookiesService,
  ) {}

  async handle(
    { refreshToken }: RefreshTokenRequest,
    response: Response,
  ): Promise<AuthenticationResult> {
    const authenticationResult =
      await this.tokensService.refreshToken(refreshToken);

    this.cookiesService.setRefreshTokenCookie(
      authenticationResult.tokens.plainRefreshToken,
      response,
    );

    return authenticationResult;
  }
}
