import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/errors';

export class InvalidComplaintError extends AppError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, HttpStatus.BAD_REQUEST, 'ComplaintsService', metadata || {});
  }
}
