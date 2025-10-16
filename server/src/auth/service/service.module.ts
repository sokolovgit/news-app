import { Module } from '@nestjs/common';
import { PasswordsService } from './passwords-service';
import { OAuthAccountsService } from './oauth-accounts-service';

const services = [PasswordsService, OAuthAccountsService];

@Module({
  providers: [...services],
  exports: [...services],
})
export class ServiceModule {}
