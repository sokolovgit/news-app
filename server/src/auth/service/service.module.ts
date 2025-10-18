import { Module } from '@nestjs/common';

import { UsersModule } from '@/users/users.module';

import { OAuthService } from './oauth/oauth-login.service';
import { LocalAuthService } from './local';
import { PasswordsService } from './passwords-service';
import { OAuthAccountsService } from './oauth-accounts-service';

import { OAuthAccountsRepository } from './abstracts/oauth-accounts.repository';
import { DrizzleOAuthAccountsRepository } from './oauth-accounts-storage';
import { OAuthLoginFactory } from './oauth/oauth-login.factory';
import { OAuthLoginStrategy } from './oauth/interfaces';
import { GoogleOAuthStrategy } from './oauth/strategies';

const services = [
  OAuthService,
  LocalAuthService,
  OAuthAccountsService,
  PasswordsService,
];

const oauthLoginStrategies = [GoogleOAuthStrategy];

@Module({
  imports: [UsersModule],
  providers: [
    ...oauthLoginStrategies,
    {
      provide: OAuthAccountsRepository,
      useClass: DrizzleOAuthAccountsRepository,
    },
    {
      provide: OAuthLoginFactory,
      inject: [...oauthLoginStrategies],
      useFactory: (...strategies: OAuthLoginStrategy[]) =>
        new OAuthLoginFactory(strategies),
    },
    ...services,
  ],
  exports: [...services],
})
export class ServiceModule {}
