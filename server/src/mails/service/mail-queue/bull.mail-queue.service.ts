import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { ConfigService } from '@/config';
import { EmailQueue } from '@/mails/domain/enums';
import { SendEmailQueueJobType } from './types';
import { SendEmailOptions } from '../mail-service/types';
import { LoggerService } from '@/logger';

@Injectable()
export class BullMailQueueService {
  constructor(
    @InjectQueue(EmailQueue.SEND_EMAIL)
    private readonly sendEmailQueue: Queue<SendEmailQueueJobType>,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async addEmailToSendQueue(options: SendEmailOptions): Promise<void> {
    this.logger.debug(
      `Adding email to send queue: to=${options.to}, subject="${options.subject}", contentType=${options.contentType}`,
    );

    const job = await this.sendEmailQueue.add(
      EmailQueue.SEND_EMAIL,
      {
        to: options.to,
        subject: options.subject,
        payload: options.payload,
        contentType: options.contentType,
        from: options.from,
      },
      {
        priority: this.configService.bullmq.defaultPriority,
        ...this.configService.bullmq[EmailQueue.SEND_EMAIL],
      },
    );

    this.logger.debug(
      `Email added to send queue with job ID: ${job.id}, priority: ${job.priority}`,
    );
  }

  async addPrioritizedEmailToSendQueue(
    options: SendEmailOptions,
  ): Promise<void> {
    this.logger.debug(
      `Adding prioritized email to send queue: to=${options.to}, subject="${options.subject}", contentType=${options.contentType}`,
    );

    const job = await this.sendEmailQueue.add(
      EmailQueue.SEND_EMAIL,
      {
        to: options.to,
        subject: options.subject,
        payload: options.payload,
        contentType: options.contentType,
        from: options.from,
      },
      {
        priority: this.configService.bullmq.highPriority,
        ...this.configService.bullmq[EmailQueue.SEND_EMAIL],
      },
    );

    this.logger.debug(
      `Prioritized email added to send queue with job ID: ${job.id}, priority: ${job.priority}`,
    );
  }
}
