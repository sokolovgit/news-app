import { Injectable } from '@nestjs/common';

import { CacheService } from '@/commons/cache';
import { LoggerService } from '@/logger';

import { UserId } from '@/users/domain/schemas';
import { SourceId } from '@/sources/domain/schemas';

import { USER_ACTIVITY_CACHE_KEYS } from '../domain/constants';
import { UserFollowedSourcesProxy } from './proxies';

@Injectable()
export class UserActivityService {
  constructor(
    private readonly logger: LoggerService,
    private readonly cacheService: CacheService,
    private readonly userFollowedSourcesProxy: UserFollowedSourcesProxy,
  ) {}

  /**
   * Get user's followed source IDs using proxy pattern
   */
  async getUserFollowedSourceIds(userId: UserId): Promise<SourceId[]> {
    this.logger.debug(`Getting user ${userId} followed source IDs`);
    return this.userFollowedSourcesProxy.getUserFollowedSourceIds(userId);
  }

  /**
   * Mark user as active for a specific source
   * Uses Redis sorted set with timestamp as score
   * Fire-and-forget operation - doesn't block
   */
  markUserActive(sourceId: SourceId, userId: UserId) {
    const key = USER_ACTIVITY_CACHE_KEYS.ACTIVE_USERS_BY_SOURCE(sourceId);
    const score = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
    const member = `user:${userId}`;

    // Fire-and-forget: don't await, let it run async
    this.cacheService.zadd(key, score, member).catch((error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to mark user ${userId} active for source ${sourceId}: ${errorMessage}`,
        errorStack,
      );
    });

    this.logger.debug(
      `Marked user ${userId} active for source ${sourceId} at ${score}`,
    );
  }

  /**
   * Mark user as active for multiple sources
   * Fire-and-forget operation - doesn't block
   */
  markUserActiveForSources(sourceIds: SourceId[], userId: UserId) {
    this.logger.debug(
      `Marking user ${userId} active for ${sourceIds.length} sources`,
    );

    if (sourceIds.length === 0) {
      this.logger.debug(`No sources to mark user ${userId} active for`);
      return;
    }

    // Fire-and-forget: mark active for all sources in parallel
    const promises = sourceIds.map((sourceId) =>
      this.markUserActive(sourceId, userId),
    );

    // Don't await - let them run async
    Promise.all(promises).catch((error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to mark user ${userId} active for ${sourceIds.length} sources: ${errorMessage}`,
        errorStack,
      );
    });

    this.logger.debug(
      `Marked user ${userId} active for ${sourceIds.length} sources`,
    );
  }

  /**
   * Count active users for a source in the last N seconds
   */
  async countActiveUsersInTimeWindowBySourceId(
    sourceId: SourceId,
    windowSeconds: number,
  ): Promise<number> {
    const key = USER_ACTIVITY_CACHE_KEYS.ACTIVE_USERS_BY_SOURCE(sourceId);
    const now = Math.floor(Date.now() / 1000);
    const minScore = now - windowSeconds;

    return this.cacheService.zcount(key, minScore, '+inf');
  }
}
