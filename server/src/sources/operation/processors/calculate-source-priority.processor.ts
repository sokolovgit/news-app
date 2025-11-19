import { Processor, WorkerHost } from '@nestjs/bullmq';

import { LoggerService } from '@/logger';

import { SourceQueue } from '@/sources/domain/queues';
import { SourcesPriorityCalculatorService } from '@/sources/service/sources-priority-calculator';

@Processor(SourceQueue.CALCULATE_SOURCE_PRIORITY)
export class CalculateSourcePriorityProcessor extends WorkerHost {
  constructor(
    private readonly sourcePriorityCalculatorService: SourcesPriorityCalculatorService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(): Promise<void> {
    this.logger.debug('Processing calculate source priority job');
    await this.sourcePriorityCalculatorService.calculateAndQueueSourcePriorities();
  }
}
