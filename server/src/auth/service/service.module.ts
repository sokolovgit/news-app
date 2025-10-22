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
import { EmailVerificationsRepository } from './abstracts/email-verifications.repository';
import { DrizzleEmailVerificationsRepository } from './email-verifications-storage';

import { JwtService } from './jwt-service';
import { OAuthLoginFactory } from './oauth/oauth-login.factory';
import { OAuthLoginStrategy } from './oauth/interfaces';
import { GoogleOAuthStrategy } from './oauth/strategies';
import { EmailVerificationsService } from './email-verifications';
import { MailsModule } from '@/mails/mails.module';

const repositories = [
  {
    provide: OAuthAccountsRepository,
    useClass: DrizzleOAuthAccountsRepository,
  },
  {
    provide: RefreshTokensRepository,
    useClass: DrizzleRefreshTokensRepository,
  },
  {
    provide: EmailVerificationsRepository,
    useClass: DrizzleEmailVerificationsRepository,
  },
];

const services = [
  JwtService,
  OAuthService,
  LocalAuthService,
  OAuthAccountsService,
  HashingService,
  TokensService,
  AuthenticationService,
  EmailVerificationsService,
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
    MailsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.auth.accessTokenSecret,
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
