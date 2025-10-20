import { Injectable } from '@nestjs/common';

import { EmailContentType } from '@/mails/domain/enums';
import { SendEmailOptions } from '../types';
import { MailSendingStrategy } from '../interfaces';

import { MailProviderService } from '../../abstracts';

@Injectable()
export class PlainMailSendingStrategy implements MailSendingStrategy {
  constructor(private readonly mailProviderService: MailProviderService) {}

  async send(options: SendEmailOptions): Promise<void> {
    const { to, subject, payload, from } = options;

    await this.mailProviderService.sendPlainMail({
      to,
      subject,
      content: payload,
      from,
    });
  }

  getContentType(): EmailContentType {
    return EmailContentType.PLAIN;
  }

  supports(contentType: EmailContentType): boolean {
    return contentType === EmailContentType.PLAIN;
  }
}
