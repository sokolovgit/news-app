import { Module } from '@nestjs/common';

import { OperationModule } from '../operation/operation.module';
import { MediaController } from './media.controller';

@Module({
  imports: [OperationModule],
  controllers: [MediaController],
})
export class UiModule {}

