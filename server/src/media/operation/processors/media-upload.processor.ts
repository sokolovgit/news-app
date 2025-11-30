import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { LoggerService } from '@/logger';
import { MediaQueue } from '@/media/domain/queues';
import { MediaUploadJobData } from '@/media/domain/types';
import { MediaUploadService } from '@/media/service/media-upload-service';

@Processor(MediaQueue.MEDIA_UPLOAD, {
  concurrency: 5,
})
export class MediaUploadProcessor extends WorkerHost {
  constructor(
    private readonly mediaUploadService: MediaUploadService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<MediaUploadJobData>): Promise<void> {
    const { id, data } = job;

    this.logger.debug(
      `Processing media upload job ${id} for ${data.targetPath}`,
    );

    try {
      await this.mediaUploadService.processUploadJob(data);

      this.logger.debug(
        `Successfully processed media upload job ${id} for ${data.targetPath}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process media upload job ${id} for ${data.targetPath}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error; // Re-throw to trigger BullMQ retry
    }
  }
}
