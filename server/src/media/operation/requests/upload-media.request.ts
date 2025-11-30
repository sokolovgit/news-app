export interface UploadFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export type UploadMediaRequest = {
  file: UploadFile;
  folder?: string;
};

export type UploadMediaFromUrlRequest = {
  url: string;
  folder?: string;
};

