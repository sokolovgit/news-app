import { Module } from '@nestjs/common';

import { ServiceModule } from './service';
import { UiModule } from './ui';

@Module({
  imports: [ServiceModule, UiModule],
  exports: [ServiceModule],
})
export class MediaModule {}
