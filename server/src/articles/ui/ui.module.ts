import { Module } from '@nestjs/common';
import { OperationModule } from '../operation/operation.module';

import { ArticlesController } from './articles.controller';

@Module({
  imports: [OperationModule],
  controllers: [ArticlesController],
})
export class UiModule {}
