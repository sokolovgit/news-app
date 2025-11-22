import { CollectorJobData } from '@/sources/service/sources-orchestrator/types';
import { FetchedPost } from '@/sources/service/sources-result/types';

/**
 * Parameters for creating a success result job
 */
export type CreateSuccessResultJobParams = {
  sourceId: CollectorJobData['sourceId'];
  sourceType: CollectorJobData['sourceType'];
  metadata: CollectorJobData['metadata'];
  collectorJobId: string;
  posts: FetchedPost[];
  nextCursor?: string;
  processingTime: number;
  priority: number;
};

/**
 * Parameters for creating an error result job
 */
export type CreateErrorResultJobParams = {
  sourceId: CollectorJobData['sourceId'];
  sourceType: CollectorJobData['sourceType'];
  metadata: CollectorJobData['metadata'];
  collectorJobId: string;
  error: Error;
  processingTime: number;
  priority: number;
};
