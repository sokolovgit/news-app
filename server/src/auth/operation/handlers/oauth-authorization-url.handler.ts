import { Injectable } from '@nestjs/common';

import { OAuthProvider } from '@/auth/domain/enums';
import { OAuthService } from '@/auth/service/oauth/oauth-login.service';
import { LoggerService } from '@/logger';

@Injectable()
export class OAuthAuthorizationUrlHandler {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly logger: LoggerService,
  ) {}

  handle(provider: OAuthProvider): string {
    this.logger.debug(
      `Getting OAuth authorization URL for provider: ${provider}`,
    );
    const url = this.oauthService.oauthAuthorizationUrl(provider);
    this.logger.debug(
      `OAuth authorization URL generated for provider: ${provider}`,
    );
    return url;
  }
}
