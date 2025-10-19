import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { TokensService } from '@/auth/service/tokens';
import { CookiesService } from '@/commons/cookies';
import { LoggerService } from '@/logger';

import { LogoutRequest } from '../requests';

@Injectable()
export class LogoutHandler {
  constructor(
    private readonly tokensService: TokensService,
    private readonly cookiesService: CookiesService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Handles user logout process
   */
  async handle(
    { refreshToken }: LogoutRequest,
    response: Response,
  ): Promise<void> {
    const process = 'user-logout';
    const processId = this.logger.startProcess(process);

    this.logger.logProcessProgress(
      processId,
      process,
      'Revoking refresh token',
    );

    await this.tokensService.logout(refreshToken);

    this.logger.logProcessProgress(
      processId,
      process,
      'Clearing refresh token cookie',
    );

    this.cookiesService.clearRefreshTokenCookie(response);

    this.logger.completeProcess(processId, process);
  }
}
