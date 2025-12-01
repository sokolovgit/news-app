import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';
import { GetAllUsersHandler } from './handlers/get-all-users.handler';
import { GetAllSourcesHandler } from './handlers/get-all-sources.handler';
import { GetAllArticlesHandler } from './handlers/get-all-articles.handler';
import { GetSourceStatsHandler } from './handlers/get-source-stats.handler';

@Module({
  imports: [ServiceModule],
  providers: [
    GetAllUsersHandler,
    GetAllSourcesHandler,
    GetAllArticlesHandler,
    GetSourceStatsHandler,
  ],
  exports: [
    GetAllUsersHandler,
    GetAllSourcesHandler,
    GetAllArticlesHandler,
    GetSourceStatsHandler,
  ],
})
export class OperationModule {}

