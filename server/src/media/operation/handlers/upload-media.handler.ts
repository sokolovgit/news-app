import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

import { S3Service } from '@/commons/s3';
import { LoggerService } from '@/logger';
import { ConfigService } from '@/config';
import { MediaUploadFailedError } from '@/media/domain/errors';
import { UploadResult } from '@/media/domain/types';
import { UploadMediaRequest, UploadMediaFromUrlRequest } from '../requests';

@Injectable()
export class UploadMediaHandler {
  constructor(
    private readonly s3Service: S3Service,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async handle(request: UploadMediaRequest): Promise<UploadResult> {
    const { file, folder = 'uploads' } = request;

    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const key = `${folder}/${uuidv4()}${ext}`;

    this.logger.debug(`Uploading file: ${file.originalname} -> ${key}`);

    try {
      await this.s3Service.uploadBuffer(key, file.buffer, file.mimetype);
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error}`);
      throw new MediaUploadFailedError('UploadMediaHandler.handle');
    }

    const baseUrl = this.buildBaseUrl();

    return {
      url: `${baseUrl}/api/media/${key}`,
      key,
      contentType: file.mimetype,
      size: file.size,
    };
  }

  async handleFromUrl(
    request: UploadMediaFromUrlRequest,
  ): Promise<UploadResult> {
    const { url, folder = 'uploads' } = request;

    this.logger.debug(`Uploading from URL: ${url}`);

    // Extract extension from URL
    const urlPath = new URL(url).pathname;
    const ext = path.extname(urlPath).toLowerCase() || '.jpg';
    const key = `${folder}/${uuidv4()}${ext}`;

    try {
      await this.s3Service.uploadFromUrl(key, url);
    } catch (error) {
      this.logger.error(`Failed to upload from URL: ${error}`);
      throw new MediaUploadFailedError('UploadMediaHandler.handleFromUrl');
    }

    const baseUrl = this.buildBaseUrl();

    return {
      url: `${baseUrl}/api/media/${key}`,
      key,
      contentType: 'image/jpeg',
      size: 0,
    };
  }

  private buildBaseUrl(): string {
    const { host, port } = this.config.server;
    // In production, use the client URL as base
    if (this.config.isProduction()) {
      return this.config.client.url;
    }
    return `http://${host}:${port}`;
  }
}
