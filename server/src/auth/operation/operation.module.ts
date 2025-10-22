import { Module } from '@nestjs/common';
import { MailsModule } from '@/mails/mails.module';
import { UsersModule } from '@/users/users.module';
import { ServiceModule } from '../service/service.module';
import {
  GetMeHandler,
  LoginHandler,
  LogoutHandler,
  RegisterHandler,
  RefreshTokenHandler,
  OAuthCallbackHandler,
  OAuthAuthorizationUrlHandler,
  VerifyEmailHandler,
} from './handlers';

const handlers = [
  GetMeHandler,
  LoginHandler,
  LogoutHandler,
  RegisterHandler,
  RefreshTokenHandler,
  VerifyEmailHandler,
  OAuthCallbackHandler,
  OAuthAuthorizationUrlHandler,
];

@Module({
  imports: [ServiceModule, MailsModule, UsersModule],
  providers: [...handlers],
  exports: [ServiceModule, ...handlers],
})
export class OperationModule {}
