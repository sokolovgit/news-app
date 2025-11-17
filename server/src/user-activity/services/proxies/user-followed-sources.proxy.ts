import { Injectable } from '@nestjs/common';

import { CacheService } from '@/commons/cache';
import { LoggerService } from '@/logger';
import { UserSourcesService } from '@/user-sources';

import { UserId } from '@/users/domain/schemas';
import { SourceId } from '@/sources/domain/schemas';

import { USER_ACTIVITY_CACHE_KEYS } from '../../domain/constants';

const FOLLOWED_SOURCES_CACHE_TTL_SECONDS = 600; // 10 minutes

@Injectable()
export class UserFollowedSourcesProxy {
  constructor(
    private readonly logger: LoggerService,
    private readonly cacheService: CacheService,
    private readonly userSourcesService: UserSourcesService,
  ) {}

  /**
   * Get user's followed source IDs from cache or database
   * Caches result for 10 minutes
   */
  async getUserFollowedSourceIds(userId: UserId): Promise<SourceId[]> {
    const cacheKey = USER_ACTIVITY_CACHE_KEYS.USER_FOLLOWED_SOURCES(userId);

    // Try cache first
    const cached = await this.cacheService.getJson<SourceId[]>(cacheKey);
    if (cached !== null) {
      this.logger.debug(
        `Cache hit for user ${userId} followed sources (${cached.length} sources)`,
      );
      return cached;
    }

    // Cache miss - fetch from database
    this.logger.debug(`Cache miss for user ${userId} followed sources`);
    const sourceIds =
      await this.userSourcesService.getAllSourceIdsByUser(userId);

    // Cache the result
    await this.cacheService.setJson<SourceId[]>(
      cacheKey,
      sourceIds,
      FOLLOWED_SOURCES_CACHE_TTL_SECONDS,
    );

    this.logger.debug(
      `Cached ${sourceIds.length} source IDs for user ${userId}`,
    );

    return sourceIds;
  }
}
