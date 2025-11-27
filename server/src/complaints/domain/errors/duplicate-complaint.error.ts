import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/errors';

export class DuplicateComplaintError extends AppError {
  constructor(targetType: string, targetId: string, userId: string) {
    super(
      'Complaint already exists for this target',
      HttpStatus.CONFLICT,
      'ComplaintsService',
      { targetType, targetId, userId },
    );
  }
}
