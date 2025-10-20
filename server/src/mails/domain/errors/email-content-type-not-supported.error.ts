import { AppError } from '@/errors';
import { EmailContentType } from '../enums';
import { HttpStatus } from '@nestjs/common';

export class EmailContentTypeNotSupportedError extends AppError {
  constructor(contentType: EmailContentType, context?: string) {
    super(
      `Email content type not supported: ${contentType}`,
      HttpStatus.NOT_IMPLEMENTED,
      context,
      { contentType },
    );
  }
}
