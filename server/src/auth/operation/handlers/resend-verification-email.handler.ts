import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { EmailVerificationsService } from '@/auth/service/email-verifications';
import { UserId } from '@/users/domain/schemas';

@Injectable()
export class ResendVerificationEmailHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly emailVerificationsService: EmailVerificationsService,
  ) {}

  async handle(userId: UserId): Promise<void> {
    const process = 'resend-verification-email';
    const processId = this.logger.startProcess(process, { userId });

    this.logger.logProcessProgress(
      processId,
      process,
      'Resending verification email',
    );

    await this.emailVerificationsService.sendEmailVerificationEmail(userId);

    this.logger.logProcessProgress(
      processId,
      process,
      'Verification email sent',
    );

    this.logger.completeProcess(processId, process, {
      userId,
    });
  }
}
