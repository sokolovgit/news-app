import { PaginationParams, Sort } from '@/commons/types';
import { ArticlesSortField } from '@/articles/service/abstracts';

export type GetPublicArticlesRequest = PaginationParams & {
  search?: string;
  sort?: Sort<ArticlesSortField>;
};
