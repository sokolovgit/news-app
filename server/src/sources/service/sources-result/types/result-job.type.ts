import { SourceId } from '@/sources/domain/schemas';
import { PublicSource } from '@/sources/domain/enums';

/**
 * Post data structure from collectors
 */
export type FetchedPost = {
  externalId: string;
  content: string;
  mediaUrls: string[];
  publishedAt: string; // ISO date
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
};

/**
 * Job data for results queue
 * Created by Collector Workers after fetching posts
 */
export type ResultJobData = {
  sourceId: SourceId;
  sourceType: PublicSource;
  status: 'success' | 'error';
  posts?: FetchedPost[];
  nextCursor?: string;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  processingTime: number; // Milliseconds
  metadata: {
    collectorJobId: string;
    orchestratorJobId: string;
    fetchedAt: Date;
  };
};
