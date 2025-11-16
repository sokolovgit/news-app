import { HttpStatus } from '@nestjs/common';

import { AppError } from '@/errors';
import { PublicSource } from '../enums';

export class SourceCreationFailedError extends AppError {
  constructor(url: string, source: PublicSource, reason?: string) {
    super(
      `Failed to create source "${url}" of type ${source}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'SourcesService',
      { url, source, reason },
    );
  }
}
