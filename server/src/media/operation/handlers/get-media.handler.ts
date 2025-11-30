import { Injectable } from '@nestjs/common';

import { S3Service, S3ObjectStream } from '@/commons/s3';
import { LoggerService } from '@/logger';
import { MediaNotFoundError } from '@/media/domain/errors';
import { GetMediaRequest } from '../requests';

@Injectable()
export class GetMediaHandler {
  constructor(
    private readonly s3Service: S3Service,
    private readonly logger: LoggerService,
  ) {}

  async handle(request: GetMediaRequest): Promise<S3ObjectStream> {
    try {
      return await this.s3Service.getObjectStream(request.path);
    } catch (err: unknown) {
      const errorName =
        err && typeof err === 'object' && 'name' in err
          ? (err as { name: string }).name
          : '';

      if (errorName === 'NoSuchKey' || errorName === 'NotFound') {
        this.logger.warn(`Media not found: ${request.path}`);
        throw new MediaNotFoundError(request.path);
      }

      this.logger.error(`Error fetching media ${request.path}: ${String(err)}`);
      throw err;
    }
  }
}
