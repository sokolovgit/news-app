import { Injectable, UnauthorizedException } from '@nestjs/common';

import { OAuthService } from '@/auth/service/oauth/oauth-login.service';

import { OAuthCallbackRequest } from '../requests';
import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';

@Injectable()
export class OAuthCallbackHandler {
  constructor(private readonly oauthService: OAuthService) {}

  async handle(request: OAuthCallbackRequest): Promise<AuthenticationResult> {
    const { provider, code, error } = request;

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!code) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.oauthService.oauthLogin(provider, code);
  }
}
