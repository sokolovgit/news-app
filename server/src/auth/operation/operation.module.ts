import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import {
  LoginHandler,
  LogoutHandler,
  RegisterHandler,
  RefreshTokenHandler,
  OAuthCallbackHandler,
  OAuthAuthorizationUrlHandler,
  VerifyEmailHandler,
} from './handlers';

const handlers = [
  LoginHandler,
  LogoutHandler,
  RegisterHandler,
  RefreshTokenHandler,
  VerifyEmailHandler,
  OAuthCallbackHandler,
  OAuthAuthorizationUrlHandler,
];

@Module({
  imports: [ServiceModule],
  providers: [...handlers],
  exports: [ServiceModule, ...handlers],
})
export class OperationModule {}
