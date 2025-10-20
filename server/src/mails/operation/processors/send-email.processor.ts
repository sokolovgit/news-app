import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { EmailQueue } from '@/mails/domain/enums';
import { MailService } from '@/mails/service/mail-service';
import { SendEmailQueueJobType } from '@/mails/service/mail-queue/types';

@Processor(EmailQueue.SEND_EMAIL)
export class SendEmailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<SendEmailQueueJobType, void, string>): Promise<void> {
    const { to, subject, payload, contentType, from } = job.data;

    await this.mailService.processEmail({
      to,
      subject,
      payload,
      contentType,
      from,
    });
  }
}
