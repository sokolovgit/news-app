import { PaginatedResult, Sort } from '@/commons/types';

import { RawPost, RawPostLoadOptions } from '@/posts/domain/entities';
import { SourceId } from '@/sources/domain/schemas';
import { RawPostId } from '@/posts/domain/schemas';

export type RawPostsSortField = 'createdAt' | 'updatedAt';

export const RAW_POSTS_SORT_FIELDS: readonly RawPostsSortField[] = [
  'createdAt',
  'updatedAt',
];

export type RawPostsSort = Sort<RawPostsSortField>;

export type GetRawPostsParams = {
  search?: string;
  sort?: RawPostsSort;
  dateFrom?: Date;
  dateTo?: Date;
  offset: number;
  limit: number;
};

export abstract class RawPostsRepository {
  abstract getRawPostById(
    id: RawPostId,
    relations?: RawPostLoadOptions,
  ): Promise<RawPost | null>;

  abstract save(rawPost: RawPost): Promise<RawPost | null>;

  abstract saveMany(rawPosts: RawPost[]): Promise<RawPost[]>;

  abstract existsByExternalIds(
    sourceId: SourceId,
    externalIds: string[],
  ): Promise<Set<string>>;

  abstract getRawPosts(
    params: GetRawPostsParams,
    loadOptions?: RawPostLoadOptions,
  ): Promise<PaginatedResult<RawPost>>;

  abstract banPost(postId: RawPostId): Promise<void>;
}
