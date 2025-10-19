import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { RegisterRequest } from '../requests';
import { LocalAuthService } from '@/auth/service/local-auth';
import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';
import { CookiesService } from '@/commons/cookies';

@Injectable()
export class RegisterHandler {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly cookiesService: CookiesService,
  ) {}

  async handle(
    request: RegisterRequest,
    response: Response,
  ): Promise<AuthenticationResult> {
    const { email, password } = request;

    const authenticationResult = await this.localAuthService.localRegister(
      email,
      password,
    );

    this.cookiesService.setRefreshTokenCookie(
      authenticationResult.tokens.plainRefreshToken,
      response,
    );

    return authenticationResult;
  }
}
