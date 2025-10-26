import { Module } from '@nestjs/common';

import { SourcesRepository } from './abstracts';
import { DrizzleSourcesRepository } from './sources-storage';

const repositories = [
  {
    provide: SourcesRepository,
    useClass: DrizzleSourcesRepository,
  },
];

@Module({
  imports: [],
  providers: [...repositories],
  exports: [],
})
export class ServiceModule {}
