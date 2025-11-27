import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';

import { LoggerService } from '@/logger';
import { MediaQueue } from '@/media/domain/queues';

import { MediaUploadJobData } from './types';

@Injectable()
export class MediaUploadQueueService {
  constructor(
    @InjectQueue(MediaQueue.MEDIA_UPLOAD)
    private readonly mediaUploadQueue: Queue<MediaUploadJobData>,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Add a media upload job to the queue.
   */
  async addJob(data: MediaUploadJobData): Promise<string> {
    const job = await this.mediaUploadQueue.add('upload-media', data, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 1000,
    });

    this.logger.debug(
      `Queued media upload job ${job.id ?? 'unknown'} for ${data.targetPath}`,
    );

    return job.id!;
  }

  /**
   * Add multiple media upload jobs in bulk.
   */
  async addBulkJobs(jobs: MediaUploadJobData[]): Promise<string[]> {
    const bulkJobs = jobs.map((data) => ({
      name: 'upload-media',
      data,
      opts: {
        attempts: 5,
        backoff: {
          type: 'exponential' as const,
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
      },
    }));

    const addedJobs = await this.mediaUploadQueue.addBulk(bulkJobs);

    this.logger.debug(`Queued ${addedJobs.length} media upload jobs in bulk`);

    return addedJobs.map((job) => job.id!);
  }
}
