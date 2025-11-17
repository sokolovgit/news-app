import { Module } from '@nestjs/common';

import { ServiceModule as UserSourcesServiceModule } from './service';

@Module({
  imports: [UserSourcesServiceModule],
  exports: [UserSourcesServiceModule],
})
export class UserSourcesModule {}
