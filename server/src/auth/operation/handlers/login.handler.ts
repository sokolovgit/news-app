import { Injectable } from '@nestjs/common';

import { LoginRequest } from '../requests/login.request';
import { LocalAuthService } from '@/auth/service/local-auth';
import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';

@Injectable()
export class LoginHandler {
  constructor(private readonly localAuthService: LocalAuthService) {}

  public async handle(request: LoginRequest): Promise<AuthenticationResult> {
    const { email, password } = request;

    return await this.localAuthService.localLogin(email, password);
  }
}
