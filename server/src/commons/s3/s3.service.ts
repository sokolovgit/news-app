import { Readable } from 'stream';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';

import { LoggerService } from '@/logger';

import { S3_CLIENT, S3_BUCKET } from './s3.constants';
import { S3ObjectStream, UploadResult } from './types';

@Injectable()
export class S3Service implements OnModuleInit {
  constructor(
    @Inject(S3_CLIENT)
    private readonly client: S3Client,
    @Inject(S3_BUCKET)
    private readonly bucket: string,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  /**
   * Upload buffer to S3.
   */
  async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    const result = await this.client.send(command);

    this.logger.debug(`Uploaded ${key} to S3 (${buffer.length} bytes)`);

    return {
      key,
      bucket: this.bucket,
      etag: result.ETag,
    };
  }

  /**
   * Upload from URL - download and upload to S3.
   */
  async uploadFromUrl(
    key: string,
    sourceUrl: string,
    contentType?: string,
  ): Promise<UploadResult> {
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download from URL: ${response.status} ${response.statusText}`,
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const detectedContentType =
      contentType ||
      response.headers.get('content-type') ||
      'application/octet-stream';

    return this.uploadBuffer(key, buffer, detectedContentType);
  }

  /**
   * Get object as stream for proxying to client.
   */
  async getObjectStream(key: string): Promise<S3ObjectStream> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error(`No body in S3 response for key: ${key}`);
    }

    return {
      stream: response.Body as Readable,
      contentType: response.ContentType || 'application/octet-stream',
      contentLength: response.ContentLength || 0,
    };
  }

  /**
   * Check if object exists.
   */
  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if ((error as { name?: string }).name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Delete object from S3.
   */
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
    this.logger.debug(`Deleted ${key} from S3`);
  }

  /**
   * Get the bucket name.
   */
  getBucket(): string {
    return this.bucket;
  }

  /**
   * Ensure bucket exists, create if not.
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      const headCommand = new HeadBucketCommand({ Bucket: this.bucket });
      await this.client.send(headCommand);
      this.logger.debug(`Bucket ${this.bucket} exists`);
    } catch (error) {
      if ((error as { name?: string }).name === 'NotFound') {
        this.logger.log(`Creating bucket: ${this.bucket}`);
        const createCommand = new CreateBucketCommand({ Bucket: this.bucket });
        await this.client.send(createCommand);
        this.logger.log(`Bucket ${this.bucket} created`);
      } else {
        throw error;
      }
    }
  }
}
