import { HttpStatus } from '@nestjs/common';

import { AppError } from '@/errors';

export class InvalidSourceUrlError extends AppError {
  constructor(url: string, reason?: string) {
    super(
      `Source URL "${url}" is invalid${reason ? `: ${reason}` : ''}`,
      HttpStatus.BAD_REQUEST,
      'SourceValidation',
      { url, reason },
    );
  }
}
