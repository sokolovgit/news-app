import { AppError } from '@/errors/app.error';
import { HttpStatus } from '@nestjs/common';

export class InvalidEmailVerificationTokenError extends AppError {
  constructor(context?: string) {
    super('Invalid email verification token', HttpStatus.BAD_REQUEST, context);
  }
}
