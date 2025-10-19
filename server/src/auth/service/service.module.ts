import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '@/users/users.module';

import { OAuthService } from './oauth/oauth-login.service';
import { ConfigService } from '@/config';
import { TokensService } from './tokens';
import { HashingService } from './hashing';
import { LocalAuthService } from './local-auth';
import { OAuthAccountsService } from './oauth-accounts';
import { AuthenticationService } from './authentication';

import { OAuthAccountsRepository } from './abstracts/oauth-accounts.repository';
import { DrizzleOAuthAccountsRepository } from './oauth-accounts-storage';
import { RefreshTokensRepository } from './abstracts/refresh-tokens.repository';
import { DrizzleRefreshTokensRepository } from './refresh-tokens-storage';

import { OAuthLoginFactory } from './oauth/oauth-login.factory';
import { OAuthLoginStrategy } from './oauth/interfaces';
import { GoogleOAuthStrategy } from './oauth/strategies';

const repositories = [
  {
    provide: OAuthAccountsRepository,
    useClass: DrizzleOAuthAccountsRepository,
  },
  {
    provide: RefreshTokensRepository,
    useClass: DrizzleRefreshTokensRepository,
  },
];

const services = [
  OAuthService,
  LocalAuthService,
  OAuthAccountsService,
  HashingService,
  TokensService,
  AuthenticationService,
];

const oauthLoginStrategies = [GoogleOAuthStrategy];

const factories = [
  {
    provide: OAuthLoginFactory,
    inject: [...oauthLoginStrategies],
    useFactory: (...strategies: OAuthLoginStrategy[]) =>
      new OAuthLoginFactory(strategies),
  },
];

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.auth.secret,
        signOptions: { expiresIn: config.auth.accessTokenExpirationInSeconds },
      }),
    }),
  ],
  providers: [
    ...repositories,
    ...oauthLoginStrategies,
    ...factories,
    ...services,
  ],
  exports: [...services],
})
export class ServiceModule {}
