import { Module } from '@nestjs/common';
import { OperationModule } from '../operation/operation.module';

import { RawPostsController } from './raw-posts.controller';

@Module({
  imports: [OperationModule],
  controllers: [RawPostsController],
})
export class UiModule {}
