import { UserId } from '@/users/domain/schemas';
import { PaginationParams, Sort } from '@/commons/types';
import { ArticlesSortField } from '@/articles/service/abstracts';
import { ArticleStatus } from '@/articles/domain/enums';

export type GetMyArticlesRequest = PaginationParams & {
  userId: UserId;
  status?: ArticleStatus;
  search?: string;
  sort?: Sort<ArticlesSortField>;
};
