import { Injectable } from '@nestjs/common';

import { OAuthProvider } from '@/auth/domain/enums';
import { OAuthService } from '@/auth/service/oauth/oauth-login.service';

@Injectable()
export class OAuthAuthorizationUrlHandler {
  constructor(private readonly oauthService: OAuthService) {}

  handle(provider: OAuthProvider): string {
    return this.oauthService.oauthAuthorizationUrl(provider);
  }
}
