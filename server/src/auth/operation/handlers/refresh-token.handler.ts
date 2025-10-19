import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { CookiesService } from '@/cookies';
import { TokensService } from '@/auth/service/tokens';
import { LoggerService } from '@/logger';

import { RefreshTokenRequest } from '../requests';
import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';

@Injectable()
export class RefreshTokenHandler {
  constructor(
    private readonly tokensService: TokensService,
    private readonly cookiesService: CookiesService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Handles refresh token renewal process
   */
  async handle(
    { refreshToken }: RefreshTokenRequest,
    response: Response,
  ): Promise<AuthenticationResult> {
    const process = 'user-refresh-token';
    const processId = this.logger.startProcess(process);

    this.logger.logProcessProgress(
      processId,
      process,
      'Validating and refreshing tokens',
    );

    const authenticationResult =
      await this.tokensService.refreshToken(refreshToken);

    this.logger.logProcessProgress(
      processId,
      process,
      'Setting new refresh token cookie',
      { userId: authenticationResult.user.getId() },
    );

    this.cookiesService.setRefreshTokenCookie(
      authenticationResult.tokens.plainRefreshToken,
      response,
    );

    this.logger.completeProcess(processId, process, {
      userId: authenticationResult.user.getId(),
    });

    return authenticationResult;
  }
}
