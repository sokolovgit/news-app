import { Module } from '@nestjs/common';
import { ServiceModule } from '../service/service.module';

import { SendEmailProcessor } from './processors';

const processors = [SendEmailProcessor];

@Module({
  imports: [ServiceModule],
  providers: [...processors],
  exports: [ServiceModule],
})
export class OperationModule {}
