import { Module } from '@nestjs/common';
import { ServiceModule } from './service/service.module';
import { OperationModule } from './operation/operation.module';
import { AdminController } from './ui/admin.controller';

@Module({
  imports: [ServiceModule, OperationModule],
  controllers: [AdminController],
  exports: [ServiceModule],
})
export class AdminModule {}

