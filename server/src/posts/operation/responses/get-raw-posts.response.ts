import { RawPost } from '@/posts/domain/entities';
import { PaginatedResult } from '@/commons/types';

export type GetRawPostsResponse = PaginatedResult<RawPost>;
