import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { ConfigService } from '@/config';
import { EmailQueue } from '@/mails/domain/enums';
import { SendEmailQueueJobType } from './types';
import { SendEmailOptions } from '../mail-service/types';

@Injectable()
export class BullMailQueueService {
  constructor(
    @InjectQueue(EmailQueue.SEND_EMAIL)
    private readonly sendEmailQueue: Queue<SendEmailQueueJobType>,
    private readonly configService: ConfigService,
  ) {}

  async addEmailToSendQueue(options: SendEmailOptions): Promise<void> {
    await this.sendEmailQueue.add(
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
  }

  async addPrioritizedEmailToSendQueue(
    options: SendEmailOptions,
  ): Promise<void> {
    await this.sendEmailQueue.add(
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
  }
}
