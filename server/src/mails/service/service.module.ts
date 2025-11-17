import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { NodemailerTransporterModule } from '@/commons/emails/nodemailer-transporter.module';

import { MailService } from './mail-service/mail.service';
import { MailProviderService } from './abstracts';
import { SmtpMailProviderService } from './mail-provider';

import {
  HtmlMailSendingStrategy,
  PlainMailSendingStrategy,
} from './mail-service/strategies';
import { MailSendingFactory } from './mail-service';
import { MailSendingStrategy } from './mail-service/interfaces';

import { EmailQueue } from '../domain/queues';
import { BullMQMailQueueService } from './mail-queue/bull.mail-queue.service';

const mailProviderServices = [
  {
    provide: MailProviderService,
    useClass: SmtpMailProviderService,
  },
];

const mailSendingStrategies = [
  HtmlMailSendingStrategy,
  PlainMailSendingStrategy,
];

const factories = [
  {
    provide: MailSendingFactory,
    inject: [...mailSendingStrategies],
    useFactory: (...strategies: MailSendingStrategy[]) =>
      new MailSendingFactory(strategies),
  },
];

const services = [MailService];
const queueServices = [BullMQMailQueueService];

const queues = [
  {
    name: EmailQueue.SEND_EMAIL,
  },
];

@Module({
  imports: [
    NodemailerTransporterModule.forRootAsync(),
    BullModule.registerQueue(...queues),
  ],
  providers: [
    ...mailProviderServices,
    ...mailSendingStrategies,
    ...factories,
    ...queueServices,
    ...services,
  ],
  exports: [...services],
})
export class ServiceModule {}
