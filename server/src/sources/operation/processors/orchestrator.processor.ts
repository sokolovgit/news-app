import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { LoggerService } from '@/logger';
import { SourceQueue } from '@/sources/domain/queues';
import { OrchestratorJobData } from '@/sources/service/sources-orchestrator-queue/types';
import { SourcesOrchestratorService } from '@/sources/service/sources-orchestrator';

@Processor(SourceQueue.ORCHESTRATOR)
export class OrchestratorProcessor extends WorkerHost {
  constructor(
    private readonly orchestratorService: SourcesOrchestratorService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<OrchestratorJobData>): Promise<void> {
    const { id, data } = job;

    this.logger.debug(
      `Processing orchestrator job ${id} for source ${data.sourceId}`,
    );

    try {
      await this.orchestratorService.processOrchestratorJob(data, id as string);

      this.logger.debug(
        `Successfully processed orchestrator job ${id} for source ${data.sourceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process orchestrator job ${id} for source ${data.sourceId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error; // Re-throw to trigger BullMQ retry
    }
  }
}
