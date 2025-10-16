import {
  Injectable,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';

import { OAuthLoginFactory } from '@/auth/service/oauth-login/oauth-login.factory';
import { OAuthCallbackRequest } from '../requests';
import { UsersService } from '@/users/service/users-service';

@Injectable()
export class OAuthCallbackHandler {
  constructor(
    private readonly oauthLoginFactory: OAuthLoginFactory,
    private readonly usersService: UsersService,
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
  }

  private async oauthLogin()
}
