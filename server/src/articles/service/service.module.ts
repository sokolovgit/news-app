import { Module } from '@nestjs/common';

import { ArticlesRepository } from './abstracts';
import { DrizzleArticlesRepository } from './articles-storage';
import { ArticlesService } from './articles-service';

const repositories = [
  {
    provide: ArticlesRepository,
    useClass: DrizzleArticlesRepository,
  },
];

const services = [ArticlesService];

@Module({
  imports: [],
  providers: [...repositories, ...services],
  exports: [...services],
})
export class ServiceModule {}
