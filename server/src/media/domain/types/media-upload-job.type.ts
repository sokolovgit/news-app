export type MediaSource = 'buffer' | 'url';

export type BaseMediaUploadJobData = {
  sourceType: 'telegram' | 'instagram';
  sourceId: string;
  postExternalId: string;
  mediaIndex: number;
  targetPath: string;
  contentType: string;
};

export type BufferMediaUploadJobData = BaseMediaUploadJobData & {
  source: 'buffer';
  buffer: string; // Base64 encoded
};

export type UrlMediaUploadJobData = BaseMediaUploadJobData & {
  source: 'url';
  sourceUrl: string;
};

export type MediaUploadJobData =
  | BufferMediaUploadJobData
  | UrlMediaUploadJobData;

