import { Module } from '@nestjs/common';
import { ServiceModule as ArticlesServiceModule } from '../service/service.module';

import {
  CreateArticleHandler,
  UpdateArticleHandler,
  DeleteArticleHandler,
  GetMyArticlesHandler,
  GetArticleByIdHandler,
  GetArticleBySlugHandler,
  GetPublicArticlesHandler,
  PublishArticleHandler,
  UnpublishArticleHandler,
} from './handlers';

const handlers = [
  CreateArticleHandler,
  UpdateArticleHandler,
  DeleteArticleHandler,
  GetMyArticlesHandler,
  GetArticleByIdHandler,
  GetArticleBySlugHandler,
  GetPublicArticlesHandler,
  PublishArticleHandler,
  UnpublishArticleHandler,
];

@Module({
  imports: [ArticlesServiceModule],
  providers: [...handlers],
  exports: [...handlers, ArticlesServiceModule],
})
export class OperationModule {}
