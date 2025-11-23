import { RawPost } from '@/posts/domain/entities';
import { PaginatedResult } from '@/commons/types';

export type GetFeedResponse = PaginatedResult<RawPost>;

