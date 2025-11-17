import { Injectable } from '@nestjs/common';

import { SendEmailOptions } from './types';
import { MailSendingFactory } from './mail-sending.factory';
import { BullMQMailQueueService } from '../mail-queue/bull.mail-queue.service';

import { EmailContentTypeNotSupportedError } from '@/mails/domain/errors';
import { LoggerService } from '@/logger';

@Injectable()
export class MailService {
  constructor(
    private readonly mailSendingFactory: MailSendingFactory,
    private readonly bullMailQueueService: BullMQMailQueueService,
    private readonly logger: LoggerService,
  ) {}

  async sendEmail(options: SendEmailOptions): Promise<void> {
    this.logger.debug(
      `Requesting to send email: to=${options.to}, subject="${options.subject}"`,
    );
    await this.bullMailQueueService.addEmailToSendQueue(options);
  }

  async sendPrioritizedEmail(options: SendEmailOptions): Promise<void> {
    this.logger.debug(
      `Requesting to send prioritized email: to=${options.to}, subject="${options.subject}"`,
    );
    await this.bullMailQueueService.addPrioritizedEmailToSendQueue(options);
  }

  async processEmail(options: SendEmailOptions): Promise<void> {
    this.logger.debug(
      `Processing email: to=${options.to}, subject="${options.subject}", contentType=${options.contentType}`,
    );

    const strategy = this.mailSendingFactory.getStrategy(options.contentType);

    if (!strategy) {
      this.logger.error(
        new EmailContentTypeNotSupportedError(options.contentType),
      );
      throw new EmailContentTypeNotSupportedError(options.contentType);
    }

    this.logger.debug(
      `Using ${strategy.constructor.name} for content type: ${options.contentType}`,
    );

    await strategy.send(options);

    this.logger.debug(`Email processed successfully: to=${options.to}`);
  }
}
