import { Injectable } from '@nestjs/common';

import { EmailContentType } from '@/mails/domain/enums';
import { MailSendingStrategy } from './interfaces';

@Injectable()
export class MailSendingFactory {
  constructor(private readonly strategies: MailSendingStrategy[]) {}

  getStrategy(contentType: EmailContentType): MailSendingStrategy | undefined {
    return this.strategies.find((strategy) => strategy.supports(contentType));
  }
}
