import { Module } from '@nestjs/common';
import { UserSourcesModule } from '@/user-sources';
import { ServiceModule as SourcesServiceModule } from '../service/service.module';

import {
  AddSourceHandler,
  ValidateSourceHandler,
  GetUserSourcesHandler,
} from './handlers';

import {
  ResultProcessor,
  OrchestratorProcessor,
  TelegramCollectorProcessor,
  CalculateSourcePriorityProcessor,
} from './processors';

const handlers = [
  ValidateSourceHandler,
  AddSourceHandler,
  GetUserSourcesHandler,
];

const processors = [
  ResultProcessor,
  OrchestratorProcessor,
  TelegramCollectorProcessor,
  CalculateSourcePriorityProcessor,
];
@Module({
  imports: [SourcesServiceModule, UserSourcesModule],
  providers: [...handlers, ...processors],
  exports: [...handlers, SourcesServiceModule],
})
export class OperationModule {}
