import { Injectable } from '@nestjs/common';

import { S3Service } from '@/commons/s3';
import { LoggerService } from '@/logger';
import { MediaUploadJobData } from '@/media/domain/types';

@Injectable()
export class MediaUploadService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly logger: LoggerService,
  ) {}

  async processUploadJob(data: MediaUploadJobData): Promise<void> {
    const startTime = Date.now();

    if (data.source === 'buffer') {
      const buffer = Buffer.from(data.buffer, 'base64');
      await this.s3Service.uploadBuffer(
        data.targetPath,
        buffer,
        data.contentType,
      );
    } else {
      await this.s3Service.uploadFromUrl(
        data.targetPath,
        data.sourceUrl,
        data.contentType,
      );
    }

    const duration = Date.now() - startTime;
    this.logger.log(
      `Uploaded media ${data.targetPath} in ${duration}ms (source: ${data.source})`,
    );
  }
}


