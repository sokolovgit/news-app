import { Module } from '@nestjs/common';
import { ServiceModule } from './service/service.module';
import { OperationModule } from './operation/operation.module';
import { ComplaintsController } from './ui/complaints.controller';

@Module({
  imports: [ServiceModule, OperationModule],
  controllers: [ComplaintsController],
  exports: [ServiceModule],
})
export class ComplaintsModule {}
