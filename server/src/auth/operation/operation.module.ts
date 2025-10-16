import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { RegisterHandler } from './handlers';
import { ServiceModule } from '../service/service.module';

const handlers = [RegisterHandler];

@Module({
  imports: [UsersModule, ServiceModule],
  providers: [...handlers],
  exports: [...handlers],
})
export class OperationModule {}
