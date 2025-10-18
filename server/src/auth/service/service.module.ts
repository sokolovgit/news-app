import { Module } from '@nestjs/common';

import { UsersModule } from '@/users/users.module';

import { OAuthService } from './oauth/oauth-login.service';
import { LocalAuthService } from './local';
import { PasswordsService } from './passwords-service';
import { OAuthAccountsService } from './oauth-accounts-service';

import { OAuthAccountsRepository } from './abstracts/oauth-accounts.repository';
import { DrizzleOAuthAccountsRepository } from './oauth-accounts-storage';

const services = [
  PasswordsService,
  OAuthAccountsService,
  OAuthService,
  LocalAuthService,
];

@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: OAuthAccountsRepository,
      useClass: DrizzleOAuthAccountsRepository,
    },
    ...services,
  ],
  exports: [...services],
})
export class ServiceModule {}
