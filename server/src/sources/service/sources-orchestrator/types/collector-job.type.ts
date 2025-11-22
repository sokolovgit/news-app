import { SourceId } from '@/sources/domain/schemas';
import { PublicSource, Collector } from '@/sources/domain/enums';

/**
 * Job data for collector queues (Instagram, Twitter, RSS)
 * Created by Orchestrator Processor after enrichment
 */
export type CollectorJobData = {
  sourceId: SourceId;
  sourceType: PublicSource;
  collector: Collector;
  externalId: string; // Username, handle, or URL
  cursor?: string;
  limit?: number;
  priority: number;
  metadata: {
    orchestratorJobId: string;
    scheduledAt: Date;
    sourceMetadata: {
      lastFetchedAt?: Date;
      lastCursor?: string;
      fetchConfig?: Record<string, unknown>;
    };
  };
};
