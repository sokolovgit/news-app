import { Injectable, UnauthorizedException } from '@nestjs/common';

import { OAuthService } from '@/auth/service/oauth/oauth-login.service';

import { OAuthCallbackRequest } from '../requests';

@Injectable()
export class OAuthCallbackHandler {
  constructor(private readonly oauthService: OAuthService) {}

  async handle(request: OAuthCallbackRequest) {
    const { provider, code, error } = request;

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!code) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.oauthService.oauthLogin(provider, code);

    return user;
  }
}
