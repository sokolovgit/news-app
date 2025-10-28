import { Module } from '@nestjs/common';

import { RawPostsRepository } from './abstracts';
import { DrizzleRawPostsRepository } from './raw-posts-storage';

import { RawPostsService } from './raw-posts-service';

const repositories = [
  {
    provide: RawPostsRepository,
    useClass: DrizzleRawPostsRepository,
  },
];

const services = [RawPostsService];

@Module({
  imports: [],
  providers: [...repositories, ...services],
  exports: [...services],
})
export class ServiceModule {}
