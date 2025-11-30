import { Module } from '@nestjs/common';

import { ServiceModule as MediaServiceModule } from '../service/service.module';

import { GetMediaHandler, UploadMediaHandler } from './handlers';
import { MediaUploadProcessor } from './processors';

const handlers = [GetMediaHandler, UploadMediaHandler];
const processors = [MediaUploadProcessor];

@Module({
  imports: [MediaServiceModule],
  providers: [...handlers, ...processors],
  exports: [...handlers, MediaServiceModule],
})
export class OperationModule {}
