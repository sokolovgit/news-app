import {
  Injectable,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';

import { OAuthService } from '@/auth/service/oauth-login/oauth.service';
import { OAuthLoginFactory } from '@/auth/service/oauth-login/oauth-login.factory';

import { OAuthCallbackRequest } from '../requests';

@Injectable()
export class OAuthCallbackHandler {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly oauthLoginFactory: OAuthLoginFactory,
  ) {}

  async handle(request: OAuthCallbackRequest) {
    if (request.error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const strategy = this.oauthLoginFactory.getStrategy(request.provider);

    if (!strategy) {
      throw new NotImplementedException('OAuth provider not implemented');
    }

    if (!request.code) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const oauthUser = await strategy.callback(request.code);

    const user = await this.oauthService.oauthLogin(
      request.provider,
      oauthUser,
    );
  }
}
