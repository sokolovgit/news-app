import { DynamicModule, Module } from '@nestjs/common';

import { ConfigService } from '@/config';

import { RabbitmqService } from './rabbitmq.service';
import { buildRabbitTopology } from './rabbitmq.topology';

@Module({})
export class RabbitmqModule {
  /**
   * Register RabbitMQ module globally.
   * Configuration is read from ConfigService and topology is built dynamically.
   */
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModule,
      global: true,
      providers: [
        {
          provide: RabbitmqService,
          useFactory: async (configService: ConfigService) => {
            const service = new RabbitmqService(configService);
            // Build topology from config and initialize
            const topology = buildRabbitTopology(configService);
            await service.initialize(topology);
            return service;
          },
          inject: [ConfigService],
        },
      ],
      exports: [RabbitmqService],
    };
  }
}
