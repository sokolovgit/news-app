import { Module } from '@nestjs/common';

import { ServiceModule as MediaServiceModule } from '../service/service.module';

import { GetMediaHandler } from './handlers';
import { MediaUploadProcessor } from './processors';

const handlers = [GetMediaHandler];
const processors = [MediaUploadProcessor];

@Module({
  imports: [MediaServiceModule],
  providers: [...handlers, ...processors],
  exports: [...handlers, MediaServiceModule],
})
export class OperationModule {}
