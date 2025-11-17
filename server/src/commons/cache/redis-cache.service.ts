import { Injectable } from '@nestjs/common';

import { RedisService } from '@/commons/redis';
import { CacheService } from './abstracts';

@Injectable()
export class RedisCacheService extends CacheService {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async get(key: string): Promise<string | null> {
    return this.redisService.get(key);
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    return this.redisService.set(key, value, ttlSeconds);
  }

  async setJson<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    return this.redisService.setJson(key, value, ttlSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    return this.redisService.getJson<T>(key);
  }

  async delete(...keys: string[]): Promise<number> {
    return this.redisService.delete(...keys);
  }

  async exists(key: string): Promise<boolean> {
    return this.redisService.exists(key);
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.redisService.zadd(key, score, member);
  }

  async zcount(
    key: string,
    min: number | string,
    max: number | string,
  ): Promise<number> {
    return this.redisService.zcount(key, min, max);
  }

  async zremrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
  ): Promise<number> {
    return this.redisService.zremrangebyscore(key, min, max);
  }
}
