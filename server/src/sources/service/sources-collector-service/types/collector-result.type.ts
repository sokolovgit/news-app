import { FetchedPost } from '@/sources/service/sources-result/types';

/**
 * Result returned by collector strategies after fetching posts
 */
export type CollectorResult = {
  posts: FetchedPost[];
  nextCursor?: string;
};
