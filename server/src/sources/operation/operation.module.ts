import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import {
  AddSourceHandler,
  TestHandler,
  ValidateSourceHandler,
} from './handlers';

const handlers = [ValidateSourceHandler, TestHandler, AddSourceHandler];

@Module({
  imports: [ServiceModule],
  providers: [...handlers],
  exports: [...handlers, ServiceModule],
})
export class OperationModule {}
