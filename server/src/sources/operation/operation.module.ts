import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import { ValidateSourceHandler } from './handlers';

const handlers = [ValidateSourceHandler];

@Module({
  imports: [ServiceModule],
  providers: [...handlers],
  exports: [...handlers, ServiceModule],
})
export class OperationModule {}
