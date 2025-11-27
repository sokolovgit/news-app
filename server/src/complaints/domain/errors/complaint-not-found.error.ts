import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/errors';

export class ComplaintNotFoundError extends AppError {
  constructor(complaintId: string) {
    super('Complaint not found', HttpStatus.NOT_FOUND, 'ComplaintsService', {
      complaintId,
    });
  }
}
