import * as dayjs from 'dayjs';

import { Injectable } from '@nestjs/common';

import { Environments } from '@/commons/enums';
import { BaseConfigService } from '@/commons/config';

import { EnvType } from './env.schema';

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

  database = {
    url: this.env.DATABASE_URL,
  };

  isProduction(): boolean {
    return this.server.env === Environments.PRODUCTION;
  }

  isDevelopment(): boolean {
    return this.server.env === Environments.DEVELOPMENT;
  }
}
