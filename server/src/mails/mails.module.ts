import { Module } from '@nestjs/common';
import { OperationModule } from './operation/operation.module';

@Module({
  imports: [OperationModule],
  exports: [OperationModule],
})
export class MailsModule {}
