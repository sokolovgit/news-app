import { CollectorJobData } from '@/sources/service/sources-orchestrator/types';

/**
 * Interface for internal collector services used by NestJS processors
 * Each source type that's handled in NestJS should have its own collector service
 */
export interface CollectorService {
  /**
   * Process a collector job: fetch posts and create result job
   * @param jobData - Full collector job data including metadata
   * @param collectorJobId - ID of the collector job
   * @param startTime - Job start time for calculating processing time
   */
  processJob(
    jobData: CollectorJobData,
    collectorJobId: string,
    startTime: number,
  ): Promise<void>;
}
