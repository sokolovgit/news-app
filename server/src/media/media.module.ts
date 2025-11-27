import { Module } from '@nestjs/common';

import { MediaController } from './ui/media.controller';
import { OperationModule } from './operation/operation.module';

@Module({
  imports: [OperationModule],
  controllers: [MediaController],
  exports: [OperationModule],
})
export class MediaModule {}
