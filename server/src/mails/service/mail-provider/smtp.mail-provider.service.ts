import { Inject, Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';

import { NODEMAILER_TRANSPORTER } from '@/commons/emails';

import { HtmlMail, MailProviderService, PlainMail } from '../abstracts';
import { ConfigService } from '@/config';

@Injectable()
export class SmtpMailProviderService extends MailProviderService {
  constructor(
    @Inject(NODEMAILER_TRANSPORTER)
    private readonly nodemailerTransporter: Transporter,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async sendPlainMail(options: PlainMail): Promise<void> {
    const { to, subject, content, from } = options;

    await this.nodemailerTransporter.sendMail({
      from: from || this.configService.mail.from,
      to,
      subject,
      text: content,
    });
  }

  async sendHtmlMail(options: HtmlMail): Promise<void> {
    const { to, subject, html, from } = options;

    await this.nodemailerTransporter.sendMail({
      from: from || this.configService.mail.from,
      to,
      subject,
      html,
    });
  }
}
