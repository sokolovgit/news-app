export abstract class CacheService {
  abstract get(key: string): Promise<string | null>;

  abstract set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null>;

  abstract setJson<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<'OK' | null>;

  abstract getJson<T>(key: string): Promise<T | null>;

  abstract delete(...keys: string[]): Promise<number>;

  abstract exists(key: string): Promise<boolean>;

  abstract zadd(key: string, score: number, member: string): Promise<number>;

  abstract zcount(
    key: string,
    min: number | string,
    max: number | string,
  ): Promise<number>;

  abstract zremrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
  ): Promise<number>;
}
