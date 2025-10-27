import { Module } from '@nestjs/common';
import { SourcesController } from './ui';
import { OperationModule } from './operation/operation.module';

@Module({
  controllers: [SourcesController],
  imports: [OperationModule],
  exports: [OperationModule],
})
export class SourcesModule {}
