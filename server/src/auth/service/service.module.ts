import { Module } from '@nestjs/common';

import { UsersModule } from '@/users/users.module';

import { OAuthService } from './oauth/oauth-login.service';
import { LocalAuthService } from './local-auth';
import { HashingService } from './hashing-service';
import { OAuthAccountsService } from './oauth-accounts-service';

import { OAuthAccountsRepository } from './abstracts/oauth-accounts.repository';
import { DrizzleOAuthAccountsRepository } from './oauth-accounts-storage';
import { RefreshTokensRepository } from './abstracts/refresh-tokens.repository';
import { DrizzleRefreshTokensRepository } from './refresh-tokens-storage';

import { OAuthLoginFactory } from './oauth/oauth-login.factory';
import { OAuthLoginStrategy } from './oauth/interfaces';
import { GoogleOAuthStrategy } from './oauth/strategies';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@/config';
import { TokensService } from './tokens';

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
