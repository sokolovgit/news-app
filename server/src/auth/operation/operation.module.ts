import { Module } from '@nestjs/common';
import {
  LoginHandler,
  LogoutHandler,
  RegisterHandler,
  RefreshTokenHandler,
  OAuthCallbackHandler,
  OAuthAuthorizationUrlHandler,
} from './handlers';
import { ServiceModule } from '../service/service.module';

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
