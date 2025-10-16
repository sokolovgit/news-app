import { Module } from '@nestjs/common';
import { PasswordsService } from './passwords';

const services = [PasswordsService];

@Module({
  providers: [...services],
  exports: [...services],
})
export class ServiceModule {}
