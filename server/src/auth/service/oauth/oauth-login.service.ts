import {
  Injectable,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '@/users/service/users-service';

import { OAuthUser } from './types';
import { OAuthAccount } from '@/auth/domain/entities';
import { OAuthProvider } from '@/auth/domain/enums';

import { User } from '@/users/domain/entities';
import { UserRole } from '@/users/domain/enums';
import { OAuthAccountsService } from '../oauth-accounts-service';
import { OAuthLoginFactory } from './oauth-login.factory';

@Injectable()
export class OAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly oauthAccountsService: OAuthAccountsService,
    private readonly oauthLoginFactory: OAuthLoginFactory,
  ) {}

  async oauthLogin(provider: OAuthProvider, code: string): Promise<User> {
    const strategy = this.oauthLoginFactory.getStrategy(provider);

    if (!strategy) {
      throw new NotImplementedException('OAuth provider not implemented');
    }

    if (!code) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const oauthUser = await strategy.callback(code);

    const oauthAccount = await this.oauthAccountsService.findByProviderWithUser(
      provider,
      oauthUser.providerId,
    );

    if (!oauthAccount) {
      const newOAuthAccount = await this.createOrLinkOAuthAccountAndUser(
        provider,
        oauthUser,
      );

      return newOAuthAccount.getUser();
    }

    return oauthAccount.getUser();
  }

  private async createOrLinkOAuthAccountAndUser(
    provider: OAuthProvider,
    oauthUser: OAuthUser,
  ): Promise<OAuthAccount> {
    const existingUser = await this.usersService.getUserByEmail(
      oauthUser.email,
    );

    if (existingUser) {
      // add check for verified email later
      const newOAuthAccount =
        await this.oauthAccountsService.createOAuthAccountOrThrow({
          userId: existingUser.getId(),
          provider,
          providerId: oauthUser.providerId,
          relations: { user: existingUser },
        });

      return newOAuthAccount;
    }

    const newUser = await this.usersService.createUserOrThrow({
      email: oauthUser.email,
      roles: [UserRole.USER],
    });

    const newOAuthAccount =
      await this.oauthAccountsService.createOAuthAccountOrThrow({
        provider,
        providerId: oauthUser.providerId,
        userId: newUser.getId(),
        relations: { user: newUser },
      });

    return newOAuthAccount;
  }
}
