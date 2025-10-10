import { Inject, Injectable } from '@nestjs/common';
import { ENV } from './config.module';

export type EnvType = Record<string, any>;

@Injectable()
export class BaseConfigService<Env extends EnvType = EnvType> {
  constructor(@Inject(ENV) protected readonly env: Env) {}
}
