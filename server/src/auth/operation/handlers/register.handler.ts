import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { RegisterRequest } from '../requests';
import { LocalAuthService } from '@/auth/service/local-auth';
import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';
import { CookiesService } from '@/commons/cookies';
import { LoggerService } from '@/logger';

@Injectable()
export class RegisterHandler {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly cookiesService: CookiesService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Handles user registration process
   */
  async handle(
    request: RegisterRequest,
    response: Response,
  ): Promise<AuthenticationResult> {
    const { email, password } = request;

    const process = 'user-registration';
    const processId = this.logger.startProcess(process, { email });

    this.logger.logProcessProgress(
      processId,
      process,
      'Creating new user account',
    );

    const authenticationResult = await this.localAuthService.localRegister(
      email,
      password,
    );

    this.logger.logProcessProgress(
      processId,
      process,
      'Setting refresh token cookie',
      { userId: authenticationResult.user.getId() },
    );

    this.cookiesService.setRefreshTokenCookie(
      authenticationResult.tokens.plainRefreshToken,
      response,
    );

    this.logger.completeProcess(processId, process, {
      userId: authenticationResult.user.getId(),
      email,
    });

    return authenticationResult;
  }
}
