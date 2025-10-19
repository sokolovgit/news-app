import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { LoginRequest } from '../requests/login.request';
import { LocalAuthService } from '@/auth/service/local-auth';
import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';
import { CookiesService } from '@/commons/cookies';

@Injectable()
export class LoginHandler {
  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly cookiesService: CookiesService,
  ) {}

  public async handle(
    request: LoginRequest,
    response: Response,
  ): Promise<AuthenticationResult> {
    const { email, password } = request;

    const authenticationResult = await this.localAuthService.localLogin(
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
