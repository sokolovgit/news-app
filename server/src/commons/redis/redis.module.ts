import { DynamicModule, Logger, Module } from '@nestjs/common';
import Redis from 'ioredis';

import { ConfigService } from '@/config';

import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

@Module({})
export class RedisModule {
  static forRoot(): DynamicModule {
    return {
      module: RedisModule,
      global: true,
      providers: [
        {
          provide: REDIS_CLIENT,
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const logger = new Logger(RedisModule.name);
            const client = new Redis(configService.redis.url, {
              maxRetriesPerRequest: null,
            });

            client.on('connect', () => logger.log('Connected to Redis'));
            client.on('error', (error) =>
              logger.error(
                `Redis connection error: ${error.message}`,
                error.stack,
              ),
            );
            client.on('end', () => logger.warn('Redis connection closed'));

            return client;
          },
        },
        RedisService,
      ],
      exports: [RedisService, REDIS_CLIENT],
    };
  }
}
