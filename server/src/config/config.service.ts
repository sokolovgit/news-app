import * as dayjs from 'dayjs';

import { Injectable } from '@nestjs/common';

import { Environments } from '@/commons/enums';

import { EnvType } from './env.schema';
import { BaseConfigService } from '../commons/config/base-config.service';

import { EmailQueue } from '@/mails/domain/queues';
import { SourceQueue, SourceJobScheduler } from '@/sources/domain/queues';
import { MediaQueue } from '@/media';

import type {
  JobsOptions,
  UpsertJobSchedulerConfig,
} from '@/commons/bullmq/types';

@Injectable()
export class ConfigService extends BaseConfigService<EnvType> {
  server = {
    port: this.env.PORT,
    host: this.env.HOST,
    env: this.env.NODE_ENV,
  };

  client = {
    url: this.env.CLIENT_URL,
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

  rabbitmq = {
    url: this.env.RABBITMQ_URL,
    timeConfig: {
      reconnectTimeInSeconds: 10,
      heartbeatIntervalInSeconds: 60,
      waitForChannelReadyTimeoutMs: 10000,
    },
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

    // Orchestrator queue - entry point for all source fetching jobs
    [SourceQueue.ORCHESTRATOR]: <JobsOptions>{
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 1000,
    },

    // Instagram collector queue (external Python script consumes this)
    [SourceQueue.INSTAGRAM_FETCHER]: <JobsOptions>{
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 1000,
    },

    // Telegram collector queue (NestJS processor)
    [SourceQueue.TELEGRAM_FETCHER]: <JobsOptions>{
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 1000,
    },

    // Unified results queue
    [SourceQueue.FETCH_RESULTS]: <JobsOptions>{
      attempts: 5, // Critical - must store results
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 1000,
    },

    // Media upload queue
    [MediaQueue.MEDIA_UPLOAD]: <JobsOptions>{
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 1000,
    },

    [SourceQueue.CALCULATE_SOURCE_PRIORITY]: <
      UpsertJobSchedulerConfig<string, null>
    >{
      jobSchedulerId: SourceJobScheduler.CALCULATE_SOURCE_PRIORITY,
      // Every 5 minutes
      repeatOptions: { every: dayjs().add(5, 'minutes').diff(dayjs(), 'ms') },
      template: {
        name: SourceQueue.CALCULATE_SOURCE_PRIORITY,
        data: null,
        opts: {
          removeOnComplete: 5,
          removeOnFail: 20,
        },
      },
    },
  };

  sources = {
    activeWindowTimeInSeconds: dayjs()
      .add(24, 'hours')
      .diff(dayjs(), 'seconds'),
  };

  telegram = {
    appId: this.env.TELEGRAM_APP_ID,
    appHash: this.env.TELEGRAM_APP_HASH,
    session: this.env.TELEGRAM_SESSION,
    phone: this.env.TELEGRAM_PHONE,
  };

  s3 = {
    endpoint: this.env.S3_ENDPOINT,
    accessKey: this.env.S3_ACCESS_KEY,
    secretKey: this.env.S3_SECRET_KEY,
    bucket: this.env.S3_BUCKET,
    region: this.env.S3_REGION,
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
