import { DynamicModule, Module } from '@nestjs/common';

import { RedisModule } from '@/commons/redis';

import { CacheService } from './abstracts';
import { RedisCacheService } from './redis-cache.service';

@Module({})
export class CacheModule {
  static forRoot(): DynamicModule {
    return {
      module: CacheModule,
      global: true,
      imports: [RedisModule],
      providers: [
        {
          provide: CacheService,
          useClass: RedisCacheService,
        },
      ],
      exports: [CacheService],
    };
  }
}
