import { Readable } from 'stream';

export type S3ObjectStream = {
  stream: Readable;
  contentType: string;
  contentLength: number;
};

export type UploadResult = {
  key: string;
  bucket: string;
  etag?: string;
};
