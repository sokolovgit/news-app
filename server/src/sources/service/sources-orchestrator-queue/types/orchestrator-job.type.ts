import { SourceId } from '@/sources/domain/schemas';

/**
 * Job data for orchestrator queue
 * Created by Priority Calculator
 */
export type OrchestratorJobData = {
  sourceId: SourceId;
  priority: number;
  scheduledBy: 'cron' | 'user' | 'webhook';
  metadata?: {
    userId?: string;
    triggerReason?: string;
  };
};
