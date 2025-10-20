import { Injectable } from '@nestjs/common';

import { SendEmailOptions } from './types';
import { MailSendingFactory } from './mail-sending.factory';
import { BullMailQueueService } from '../mail-queue/bull.mail-queue.service';

import { EmailContentTypeNotSupportedError } from '@/mails/domain/errors';

@Injectable()
export class MailService {
  constructor(
    private readonly mailSendingFactory: MailSendingFactory,
    private readonly bullMailQueueService: BullMailQueueService,
  ) {}

  async sendEmail(options: SendEmailOptions): Promise<void> {
    await this.bullMailQueueService.addEmailToSendQueue(options);
  }

  async sendPrioritizedEmail(options: SendEmailOptions): Promise<void> {
    await this.bullMailQueueService.addPrioritizedEmailToSendQueue(options);
  }

  async processEmail(options: SendEmailOptions): Promise<void> {
    const strategy = this.mailSendingFactory.getStrategy(options.contentType);

    if (!strategy) {
      throw new EmailContentTypeNotSupportedError(options.contentType);
    }

    await strategy.send(options);
  }
}
