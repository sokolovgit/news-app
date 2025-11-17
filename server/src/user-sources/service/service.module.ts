import { Module } from '@nestjs/common';

import { UserSourcesRepository } from './abstracts';
import { DrizzleUserSourcesRepository } from './user-sources-storage';

import { UserSourcesService } from './user-sources-service';

const repositories = [
  {
    provide: UserSourcesRepository,
    useClass: DrizzleUserSourcesRepository,
  },
];

const services = [UserSourcesService];

@Module({
  providers: [...repositories, ...services],
  exports: [...services],
})
export class ServiceModule {}
