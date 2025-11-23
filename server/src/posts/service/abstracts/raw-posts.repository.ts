import { SourceId } from '@/sources/domain/schemas';
import { RawPostId } from '@/posts/domain/schemas';
import { RawPost, RawPostLoadOptions } from '@/posts/domain/entities';
import { PaginatedResult, Sort } from '@/commons/types';

/**
 * Sortable fields for feed posts
 */
export type FeedSortField = 'createdAt' | 'updatedAt';

/**
 * Sort configuration for feed posts
 */
export type FeedSort = Sort<FeedSortField>;

export type GetFeedPostsParams = {
  sourceIds: SourceId[];
  search?: string;
  sort?: FeedSort;
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

  abstract getFeedPosts(
    params: GetFeedPostsParams,
    loadOptions?: RawPostLoadOptions,
  ): Promise<PaginatedResult<RawPost>>;
}
