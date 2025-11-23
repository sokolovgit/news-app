import { Module } from '@nestjs/common';
import { UserSourcesModule } from '@/user-sources';
import { ServiceModule as PostsServiceModule } from '../service/service.module';

import { GetFeedHandler } from './handlers';

const handlers = [GetFeedHandler];

@Module({
  imports: [PostsServiceModule, UserSourcesModule],
  providers: [...handlers],
  exports: [...handlers, PostsServiceModule],
})
export class OperationModule {}
