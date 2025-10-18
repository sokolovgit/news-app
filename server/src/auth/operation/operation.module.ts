import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import {
  LoginHandler,
  RegisterHandler,
  OAuthCallbackHandler,
  OAuthAuthorizationUrlHandler,
} from './handlers';

const handlers = [
  RegisterHandler,
  LoginHandler,
  OAuthCallbackHandler,
  OAuthAuthorizationUrlHandler,
];

@Module({
  imports: [ServiceModule],
  providers: [...handlers],
  exports: [...handlers],
})
export class OperationModule {}
