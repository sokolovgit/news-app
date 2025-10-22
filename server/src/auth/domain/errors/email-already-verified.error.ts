import { HttpStatus } from '@nestjs/common';
import { AppError } from '@/errors';

export class EmailAlreadyVerifiedError extends AppError {
  constructor(context?: string) {
    super('Email already verified', HttpStatus.BAD_REQUEST, context);
  }
}
