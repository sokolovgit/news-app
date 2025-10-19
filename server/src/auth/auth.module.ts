import { Module } from '@nestjs/common';
import { AuthController } from './ui/auth.controller';
import { OperationModule } from './operation/operation.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards';

@Module({
  controllers: [AuthController],
  imports: [OperationModule],
  exports: [OperationModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
