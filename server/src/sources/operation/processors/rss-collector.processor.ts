import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { LoggerService } from '@/logger';
import { SourceQueue } from '@/sources/domain/queues';
import { CollectorJobData } from '@/sources/service/sources-orchestrator/types';
import { SourcesCollectorQueueService } from '@/sources/service/sources-collector-queue';

@Processor(SourceQueue.RSS_FETCHER)
export class RssCollectorProcessor extends WorkerHost {
  constructor(
    private readonly sourcesCollectorQueueService: SourcesCollectorQueueService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<CollectorJobData>): Promise<void> {
    const { id, data } = job;

    this.logger.debug(
      `Processing RSS collector job ${id} for source ${data.sourceId}`,
    );

    try {
      await this.sourcesCollectorQueueService.processCollectorJob(
        data,
        id as string,
      );

      this.logger.debug(
        `Successfully processed RSS collector job ${id} for source ${data.sourceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process RSS collector job ${id} for source ${data.sourceId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error; // Re-throw to trigger BullMQ retry
    }
  }
}
