import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { TokensService } from '@/auth/service/tokens';
import { CookiesService } from '@/commons/cookies';

import { LogoutRequest } from '../requests';

@Injectable()
export class LogoutHandler {
  constructor(
    private readonly tokensService: TokensService,
    private readonly cookiesService: CookiesService,
  ) {}

  async handle(
    { refreshToken }: LogoutRequest,
    response: Response,
  ): Promise<void> {
    await this.tokensService.logout(refreshToken);
    this.cookiesService.clearRefreshTokenCookie(response);
  }
}
