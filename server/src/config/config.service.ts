import * as dayjs from 'dayjs';

import { Injectable } from '@nestjs/common';
import { JobsOptions } from 'bullmq';

import { Environments } from '@/commons/enums';

import { EnvType } from './env.schema';
import { BaseConfigService } from '../commons/config/base-config.service';

import { EmailQueue } from '@/mails/domain/enums';

@Injectable()
export class ConfigService extends BaseConfigService<EnvType> {
  server = {
    port: this.env.PORT,
    host: this.env.HOST,
    env: this.env.NODE_ENV,
  };

  auth = {
    accessTokenSecret: this.env.JWT_SECRET,
    refreshTokenSecret: this.env.REFRESH_TOKEN_SECRET,
    accessTokenExpirationInSeconds: dayjs()
      .add(15, 'minutes')
      .diff(dayjs(), 'seconds'),
    refreshTokenExpiresInMs: dayjs().add(7, 'days').diff(dayjs(), 'ms'),
  };

  docs = {
    enabled: this.env.DOCS_ENABLED,
    path: this.env.DOCS_PATH,
  };

  bullboard = {
    enabled: this.env.BULLBOARD_ENABLED,
    path: this.env.BULLBOARD_PATH,
  };

  database = {
    url: this.env.DATABASE_URL,
  };

  redis = {
    url: this.env.REDIS_URL,
  };

  smtp = {
    host: this.env.SMTP_HOST,
    port: this.env.SMTP_PORT,
    auth: this.getSmtpAuth(),
    secure: this.env.SMTP_SECURE,
  };

  mail = {
    from: this.env.MAIL_FROM,
  };

  bullmq = {
    defaultPriority: 10,
    highPriority: 1,

    [EmailQueue.SEND_EMAIL]: <JobsOptions>{
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 5,
      removeOnFail: 20,
    },
  };

  isProduction(): boolean {
    return this.server.env === Environments.PRODUCTION;
  }

  isDevelopment(): boolean {
    return this.server.env === Environments.DEVELOPMENT;
  }

  private getSmtpAuth(): { user: string; pass: string } | undefined {
    if (!this.env.SMTP_USERNAME || !this.env.SMTP_PASSWORD) {
      return undefined;
    }

    return { user: this.env.SMTP_USERNAME, pass: this.env.SMTP_PASSWORD };
  }
}
