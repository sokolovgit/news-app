import { Module } from '@nestjs/common';

import { ServiceModule as UserActivityServiceModule } from './services';

@Module({
  imports: [UserActivityServiceModule],
  exports: [UserActivityServiceModule],
})
export class UserActivityModule {}
