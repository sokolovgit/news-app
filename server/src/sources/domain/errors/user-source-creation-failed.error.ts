import { HttpStatus } from '@nestjs/common';

import { AppError } from '@/errors';
import { UserId } from '@/users/domain/schemas';
import { SourceId } from '../schemas';

export class UserSourceCreationFailedError extends AppError {
  constructor(userId: UserId, sourceId: SourceId, reason?: string) {
    super(
      `Failed to create user-source relation for user ${userId} and source ${sourceId}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'UserSourcesService',
      { userId, sourceId, reason },
    );
  }
}
