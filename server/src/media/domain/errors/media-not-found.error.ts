import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/errors';

export class MediaNotFoundError extends AppError {
  constructor(path: string, context?: string) {
    super('Media not found', HttpStatus.NOT_FOUND, context, { path });
  }
}

