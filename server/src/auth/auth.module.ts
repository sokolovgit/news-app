import { Module } from '@nestjs/common';
import { AuthController } from './ui/auth.controller';
import { OperationModule } from './operation/operation.module';

@Module({
  controllers: [AuthController],
  imports: [OperationModule],
  exports: [OperationModule],
})
export class AuthModule {}
