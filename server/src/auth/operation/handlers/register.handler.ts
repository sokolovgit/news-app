import { Injectable } from '@nestjs/common';
import { RegisterRequest } from '../requests';

import { LocalAuthService } from '@/auth/service/local-auth';
import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';

@Injectable()
export class RegisterHandler {
  constructor(private readonly localAuthService: LocalAuthService) {}

  async handle(request: RegisterRequest): Promise<AuthenticationResult> {
    const { email, password } = request;

    return await this.localAuthService.localRegister(email, password);
  }
}
