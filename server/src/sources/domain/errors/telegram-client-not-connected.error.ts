import { AppError } from '@/errors';
import { HttpStatus } from '@nestjs/common';

export class TelegramClientNotConnectedError extends AppError {
  constructor(context?: string) {
    super(
      'Telegram client not connected',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context,
    );
  }
}
