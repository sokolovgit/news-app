import { Inject, Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';

import { NODEMAILER_TRANSPORTER } from '@/commons/emails';

import { HtmlMail, MailProviderService, PlainMail } from '../abstracts';
import { ConfigService } from '@/config';
import { LoggerService } from '@/logger';

@Injectable()
export class SmtpMailProviderService extends MailProviderService {
  constructor(
    @Inject(NODEMAILER_TRANSPORTER)
    private readonly nodemailerTransporter: Transporter,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async sendPlainMail(options: PlainMail): Promise<void> {
    const { to, subject, content, from } = options;
    const emailFrom = from || this.configService.mail.from;

    this.logger.debug(
      `Sending plain text email via SMTP: from=${emailFrom}, to=${to}, subject="${subject}"`,
    );

    const startTime = Date.now();

    try {
      await this.nodemailerTransporter.sendMail({
        from: emailFrom,
        to,
        subject,
        text: content,
      });

      const duration = Date.now() - startTime;

      this.logger.debug(
        `Plain text email sent successfully to=${to}, duration=${duration}ms`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send plain text email: to=${to}, duration=${duration}ms, error=${errorMessage}`,
      );
      throw error;
    }
  }

  async sendHtmlMail(options: HtmlMail): Promise<void> {
    const { to, subject, html, from } = options;
    const emailFrom = from || this.configService.mail.from;

    this.logger.debug(
      `Sending HTML email via SMTP: from=${emailFrom}, to=${to}, subject="${subject}"`,
    );

    const startTime = Date.now();

    try {
      await this.nodemailerTransporter.sendMail({
        from: emailFrom,
        to,
        subject,
        html,
      });

      const duration = Date.now() - startTime;

      this.logger.debug(
        `HTML email sent successfully to=${to}, duration=${duration}ms`,
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send HTML email: to=${to}, duration=${duration}ms, error=${errorMessage}`,
      );
      throw error;
    }
  }
}
