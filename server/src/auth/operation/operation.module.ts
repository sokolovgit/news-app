import { Module } from '@nestjs/common';
import { RegisterHandler } from './handlers';
import { ServiceModule } from '../service/service.module';

const handlers = [RegisterHandler];

@Module({
  imports: [ServiceModule],
  providers: [...handlers],
  exports: [...handlers],
})
export class OperationModule {}
