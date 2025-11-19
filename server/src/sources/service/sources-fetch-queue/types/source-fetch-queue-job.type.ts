import { SourceId } from '@/sources/domain/schemas';
import { Collector, PublicSource } from '@/sources/domain/enums';

export type SourceFetchJobData = {
  sourceId: SourceId;
  sourceType: PublicSource;
  collector: Collector;
  url: string;
  cursor?: string;
  limit?: number;
  scheduledBy?: 'cron' | 'user';
  userId?: string;
};

export type SourceFetchJobResult = {
  status: 'success' | 'partial' | 'error';
  postsCount: number;
  newPostsCount: number;
  nextCursor?: string;
  error?: string;
};
