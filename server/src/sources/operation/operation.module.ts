import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import { TestHandler, ValidateSourceHandler } from './handlers';

const handlers = [ValidateSourceHandler, TestHandler];

@Module({
  imports: [ServiceModule],
  providers: [...handlers],
  exports: [...handlers, ServiceModule],
})
export class OperationModule {}
