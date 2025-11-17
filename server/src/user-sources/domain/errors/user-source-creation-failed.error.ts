import { HttpStatus } from '@nestjs/common';

import { AppError } from '@/errors';
import { UserId } from '@/users/domain/schemas';
import { SourceId } from '@/sources/domain/schemas';

export class UserSourceCreationFailedError extends AppError {
  constructor(userId: UserId, sourceId: SourceId, context?: string) {
    super(
      'Failed to create user-source link',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
      {
        userId,
        sourceId,
      },
    );
  }
}
