import { RawPost } from '@/raw-posts/domain/entities';
import { PaginatedResult } from '@/commons/types';

export type GetRawPostsResponse = PaginatedResult<RawPost>;
