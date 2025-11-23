import { Module } from '@nestjs/common';
import { OperationModule } from '../operation/operation.module';

import { FeedController } from './feed.controller';

@Module({
  imports: [OperationModule],
  controllers: [FeedController],
})
export class UiModule {}
