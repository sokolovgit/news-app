import { Response } from 'express';
import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { CookiesService } from '@/cookies';

import { JwtService } from '@/auth/service/jwt-service';
import { TokensService } from '@/auth/service/tokens';
import { EmailVerificationsService } from '@/auth/service/email-verifications';

import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';
@Injectable()
export class VerifyEmailHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly emailVerificationsService: EmailVerificationsService,
    private readonly tokensService: TokensService,
    private readonly jwtService: JwtService,
    private readonly cookiesService: CookiesService,
  ) {}

  async handle(
    token: string,
    response: Response,
  ): Promise<AuthenticationResult> {
    const process = 'verify-email';
    const processId = this.logger.startProcess(process, { token });

    this.logger.logProcessProgress(processId, process, 'Verifying email');

    await this.emailVerificationsService.verifyEmail(token);

    this.logger.logProcessProgress(
      processId,
      process,
      'Email verified, issuing authentication tokens',
    );

    // Get user from the JWT token to issue new auth tokens
    const user = await this.jwtService.getUserFromJwtTokenOrThrow(token, {
      withEmailVerification: true,
    });

    // Issue new tokens for automatic login
    const tokens = await this.tokensService.issueTokens(user);

    this.cookiesService.setRefreshTokenCookie(
      tokens.plainRefreshToken,
      response,
    );

    this.logger.completeProcess(processId, process, {
      userId: user.getId(),
    });

    return { user, tokens };
  }
}
