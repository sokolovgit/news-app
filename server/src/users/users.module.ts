import { Module } from '@nestjs/common';
import { OperationModule } from './operation/operation.module';
import { UsersController } from './ui/users.controller';

@Module({
  imports: [OperationModule],
  exports: [OperationModule],
  controllers: [UsersController],
})
export class UsersModule {}
