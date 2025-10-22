import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { EmailVerificationsService } from '@/auth/service/email-verifications';

@Injectable()
export class VerifyEmailHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly emailVerificationsService: EmailVerificationsService,
  ) {}

  async handle(token: string): Promise<void> {
    const process = 'verify-email';
    const processId = this.logger.startProcess(process, { token });

    this.logger.logProcessProgress(processId, process, 'Verifying email');

    await this.emailVerificationsService.verifyEmail(token);

    this.logger.logProcessProgress(processId, process, 'Email verified');

    this.logger.completeProcess(processId, process, {
      token,
    });
  }
}
