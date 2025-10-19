import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import {
  LoginHandler,
  LogoutHandler,
  RegisterHandler,
  RefreshTokenHandler,
  OAuthCallbackHandler,
  OAuthAuthorizationUrlHandler,
} from './handlers';

const handlers = [
  LoginHandler,
  LogoutHandler,
  RegisterHandler,
  RefreshTokenHandler,
  OAuthCallbackHandler,
  OAuthAuthorizationUrlHandler,
];

@Module({
  imports: [ServiceModule],
  providers: [...handlers],
  exports: [ServiceModule, ...handlers],
})
export class OperationModule {}
