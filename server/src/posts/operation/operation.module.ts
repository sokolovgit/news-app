import { Module } from '@nestjs/common';
import { ServiceModule as PostsServiceModule } from '../service/service.module';

import { GetRawPostsHandler, GetRawPostByIdHandler } from './handlers';

const handlers = [GetRawPostsHandler, GetRawPostByIdHandler];

@Module({
  imports: [PostsServiceModule],
  providers: [...handlers],
  exports: [...handlers, PostsServiceModule],
})
export class OperationModule {}
