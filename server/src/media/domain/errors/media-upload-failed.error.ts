import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/errors';

export class MediaUploadFailedError extends AppError {
  constructor(context?: string) {
    super(
      'Failed to upload media',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
    );
  }
}
