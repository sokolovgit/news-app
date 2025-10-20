import { Injectable } from '@nestjs/common';

import { EmailContentType } from '@/mails/domain/enums';
import { SendEmailOptions } from '../types';
import { MailSendingStrategy } from '../interfaces';

import { MailProviderService } from '../../abstracts';
import { LoggerService } from '@/logger';

@Injectable()
export class PlainMailSendingStrategy implements MailSendingStrategy {
  constructor(
    private readonly mailProviderService: MailProviderService,
    private readonly logger: LoggerService,
  ) {}

  async send(options: SendEmailOptions): Promise<void> {
    const { to, subject, payload, from } = options;

    this.logger.debug(
      `Sending plain text email to=${to}, subject="${subject}"`,
    );

    await this.mailProviderService.sendPlainMail({
      to,
      subject,
      content: payload,
      from,
    });

    this.logger.debug(`Plain text email sent to=${to}`);
  }

  getContentType(): EmailContentType {
    return EmailContentType.PLAIN;
  }

  supports(contentType: EmailContentType): boolean {
    return contentType === EmailContentType.PLAIN;
  }
}
