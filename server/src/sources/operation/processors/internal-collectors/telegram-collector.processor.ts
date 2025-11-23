import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { LoggerService } from '@/logger';
import { SourceQueue } from '@/sources/domain/queues';
import { CollectorJobData } from '@/sources/service/sources-orchestrator/types';
import { TelegramCollectorService } from '@/sources/service/collectors';

@Processor(SourceQueue.TELEGRAM_FETCHER)
export class TelegramCollectorProcessor extends WorkerHost {
  constructor(
    private readonly logger: LoggerService,
    private readonly telegramCollectorService: TelegramCollectorService,
  ) {
    super();
  }

  async process(job: Job<CollectorJobData>): Promise<void> {
    const { id, data } = job;
    const startTime = Date.now();

    this.logger.debug(
      `Processing Telegram collector job ${id} for source ${data.sourceId}`,
    );

    await this.telegramCollectorService.processJob(
      data,
      id as string,
      startTime,
    );
  }
}
