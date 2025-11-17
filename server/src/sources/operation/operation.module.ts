import { Module } from '@nestjs/common';
import { ServiceModule as SourcesServiceModule } from '../service/service.module';
import { UserSourcesModule } from '@/user-sources';

import {
  TestHandler,
  AddSourceHandler,
  ValidateSourceHandler,
} from './handlers';

import { CalculateSourcePriorityProcessor } from './processors';

const handlers = [ValidateSourceHandler, TestHandler, AddSourceHandler];

const processors = [CalculateSourcePriorityProcessor];
@Module({
  imports: [SourcesServiceModule, UserSourcesModule],
  providers: [...handlers, ...processors],
  exports: [...handlers, SourcesServiceModule],
})
export class OperationModule {}
