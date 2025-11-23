import { UserId } from '@/users/domain/schemas';
import { SourceId } from '@/sources/domain/schemas';
import { PaginationParams, Sort } from '@/commons/types';
import { FeedSortField } from '@/posts/service/abstracts';

export type GetFeedRequest = PaginationParams & {
  userId: UserId;
  sourceIds?: SourceId[];
  search?: string;
  sort?: Sort<FeedSortField>;
  dateFrom?: Date;
  dateTo?: Date;
};
