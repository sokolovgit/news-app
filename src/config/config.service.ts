import { Injectable } from '@nestjs/common';
import { EnvType } from './env.schema';
import { BaseConfigService } from '@/commons/config/base-config.service';

@Injectable()
export class ConfigService extends BaseConfigService<EnvType> {
  server = {
    port: this.env.PORT,
    host: this.env.HOST,
  };

  docs = {
    enabled: this.env.DOCS_ENABLED,
    path: this.env.DOCS_PATH,
  };
}
