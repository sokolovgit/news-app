import { Module } from '@nestjs/common';
import { UserSourcesModule } from '@/user-sources';
import { ServiceModule as SourcesServiceModule } from '../service/service.module';

import {
  TestHandler,
  AddSourceHandler,
  ValidateSourceHandler,
} from './handlers';

import {
  ResultProcessor,
  OrchestratorProcessor,
  RssCollectorProcessor,
  TwitterCollectorProcessor,
  TelegramCollectorProcessor,
  InstagramCollectorProcessor,
  CalculateSourcePriorityProcessor,
} from './processors';

const handlers = [ValidateSourceHandler, TestHandler, AddSourceHandler];

const processors = [
  ResultProcessor,
  OrchestratorProcessor,
  RssCollectorProcessor,
  TwitterCollectorProcessor,
  TelegramCollectorProcessor,
  InstagramCollectorProcessor,
  CalculateSourcePriorityProcessor,
];
@Module({
  imports: [SourcesServiceModule, UserSourcesModule],
  providers: [...handlers, ...processors],
  exports: [...handlers, SourcesServiceModule],
})
export class OperationModule {}
