import { ConfigService } from '@/config';
import { RabbitSetupConfig } from './types';

export function buildRabbitTopology(config: ConfigService): RabbitSetupConfig {
  const { url, timeConfig } = config.rabbitmq;
  console.log(url, timeConfig);
  return {
    exchanges: [],
    queues: [],
    bindings: [],
  };
}
