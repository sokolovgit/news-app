import { Module } from '@nestjs/common';
import { UserSourcesModule } from '@/user-sources';

import { ServiceModule as SourcesServiceModule } from '../service/service.module';

import {
  AddSourceHandler,
  ValidateSourceHandler,
  GetUserSourcesHandler,
  GetAllSourcesHandler,
  GetUserSourceTypesHandler,
  GetDashboardStatsHandler,
} from './handlers';

import {
  ResultProcessor,
  OrchestratorProcessor,
  TelegramCollectorProcessor,
  CalculateSourcePriorityProcessor,
} from './processors';
import { RawPostsModule } from '@/raw-posts/raw-posts.module';

const handlers = [
  ValidateSourceHandler,
  AddSourceHandler,
  GetUserSourcesHandler,
  GetAllSourcesHandler,
  GetUserSourceTypesHandler,
  GetDashboardStatsHandler,
];

const processors = [
  ResultProcessor,
  OrchestratorProcessor,
  TelegramCollectorProcessor,
  CalculateSourcePriorityProcessor,
];
@Module({
  imports: [SourcesServiceModule, UserSourcesModule, RawPostsModule],
  providers: [...handlers, ...processors],
  exports: [...handlers, SourcesServiceModule],
})
export class OperationModule {}
