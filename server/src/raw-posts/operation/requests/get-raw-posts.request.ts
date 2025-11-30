import { UserId } from '@/users/domain/schemas';
import { PaginationParams, Sort } from '@/commons/types';
import { RawPostsSortField } from '@/raw-posts/service/abstracts';

export type GetRawPostsRequest = PaginationParams & {
  userId: UserId;
  search?: string;
  sort?: Sort<RawPostsSortField>;
  dateFrom?: Date;
  dateTo?: Date;
};
