import { Module } from '@nestjs/common';

import { CacheModule } from '@/commons/cache';
import { UserSourcesModule } from '@/user-sources';

import { UserActivityService } from './user-activity.service';
import { UserFollowedSourcesProxy } from './proxies';

const proxies = [UserFollowedSourcesProxy];
const services = [UserActivityService];

@Module({
  imports: [CacheModule, UserSourcesModule],
  providers: [...proxies, ...services],
  exports: [...services],
})
export class ServiceModule {}
