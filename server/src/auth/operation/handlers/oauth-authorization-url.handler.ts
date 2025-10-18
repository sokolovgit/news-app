import { Injectable, NotImplementedException } from '@nestjs/common';

import { OAuthProvider } from '@/auth/domain/enums';
import { OAuthLoginFactory } from '@/auth/service/oauth/oauth-login.factory';

@Injectable()
export class OAuthAuthorizationUrlHandler {
  constructor(private readonly oauthLoginFactory: OAuthLoginFactory) {}

  handle(provider: OAuthProvider): string {
    const strategy = this.oauthLoginFactory.getStrategy(provider);

    if (!strategy) {
      throw new NotImplementedException('OAuth provider not implemented');
    }

    return strategy.getAuthorizationUrl();
  }
}
