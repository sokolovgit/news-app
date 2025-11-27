import { Module } from '@nestjs/common';
import { SourcesModule } from '@/sources/sources.module';
import { PostsModule } from '@/posts/posts.module';

import { ComplaintsRepository } from './abstracts';
import { DrizzleComplaintsRepository } from './complaints-storage';

import { ComplaintsService } from './complaints-service';
import { ComplaintsValidationService } from './complaints-validation';

const repositories = [
  {
    provide: ComplaintsRepository,
    useClass: DrizzleComplaintsRepository,
  },
];

const services = [ComplaintsService, ComplaintsValidationService];

@Module({
  imports: [SourcesModule, PostsModule],
  providers: [...repositories, ...services],
  exports: [...services],
})
export class ServiceModule {}
