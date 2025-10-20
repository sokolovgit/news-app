import { Module } from '@nestjs/common';

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
import { BullMailQueueService } from './mail-queue/bull.mail-queue.service';
import { BullModule } from '@nestjs/bullmq';
import { EmailQueue } from '../domain/enums';

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
const queueServices = [BullMailQueueService];

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
