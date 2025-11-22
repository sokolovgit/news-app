import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { LoggerService } from '@/logger';
import { SourceQueue } from '@/sources/domain/queues';
import { ResultJobData } from '@/sources/service/sources-result/types';
import { SourcesResultService } from '@/sources/service/sources-result';

@Processor(SourceQueue.FETCH_RESULTS)
export class ResultProcessor extends WorkerHost {
  constructor(
    private readonly resultService: SourcesResultService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<ResultJobData>): Promise<void> {
    const { id, data } = job;

    this.logger.debug(
      `Processing result job ${id} for source ${data.sourceId}, status=${data.status}`,
    );

    try {
      await this.resultService.processResultJob(data);

      this.logger.debug(
        `Successfully processed result job ${id} for source ${data.sourceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process result job ${id} for source ${data.sourceId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error; // Re-throw to trigger BullMQ retry
    }
  }
}
