import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';

import { EmailQueue } from '@/mails/domain/queues';
import { MailService } from '@/mails/service/mail-service';
import { SendEmailQueueJobType } from '@/mails/service/mail-queue/types';
import { LoggerService } from '@/logger';

@Processor(EmailQueue.SEND_EMAIL)
export class SendEmailProcessor extends WorkerHost {
  constructor(
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<SendEmailQueueJobType, void, string>): Promise<void> {
    const { to, subject, payload, contentType, from } = job.data;

    const processId = this.logger.startProcess('send-email-job', {
      jobId: job.id,
      to,
      subject,
      contentType,
      from,
      attemptsMade: job.attemptsMade,
    });

    try {
      this.logger.logProcessProgress(
        processId,
        'send-email-job',
        'Processing email',
        {
          jobId: job.id,
          to,
          subject,
        },
      );

      await this.mailService.processEmail({
        to,
        subject,
        payload,
        contentType,
        from,
      });

      this.logger.completeProcess(processId, 'send-email-job', {
        jobId: job.id,
        to,
        subject,
      });
    } catch (error) {
      this.logger.errorProcess(
        processId,
        'send-email-job',
        error instanceof Error ? error : new Error(String(error)),
        {
          jobId: job.id,
          to,
          subject,
          attemptsMade: job.attemptsMade,
        },
      );
      throw error;
    }
  }
}
