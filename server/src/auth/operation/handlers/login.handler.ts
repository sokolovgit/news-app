import { Injectable } from '@nestjs/common';

import { LoginRequest } from '../requests/login.request';
import { LocalAuthService } from '@/auth/service/local';

@Injectable()
export class LoginHandler {
  constructor(private readonly localAuthService: LocalAuthService) {}

  public async handle(request: LoginRequest) {
    const { email, password } = request;

    const user = await this.localAuthService.localLogin(email, password);

    return user;
  }
}
