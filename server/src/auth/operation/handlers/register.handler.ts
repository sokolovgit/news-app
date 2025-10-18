import { Injectable } from '@nestjs/common';
import { RegisterRequest } from '../requests';

import { LocalAuthService } from '@/auth/service/local';

@Injectable()
export class RegisterHandler {
  constructor(private readonly localAuthService: LocalAuthService) {}

  async handle(request: RegisterRequest) {
    const { email, password } = request;

    const user = await this.localAuthService.localRegister(email, password);

    return user;
  }
}
