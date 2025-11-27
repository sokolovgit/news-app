import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { MediaQueue } from '../domain/queues';

import { MediaUploadService } from './media-upload.service';
import { MediaUploadQueueService } from './media-upload-queue.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: MediaQueue.MEDIA_UPLOAD,
    }),
  ],
  providers: [MediaUploadService, MediaUploadQueueService],
  exports: [MediaUploadService, MediaUploadQueueService],
})
export class ServiceModule {}
