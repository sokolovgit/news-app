export const USER_ACTIVITY_CACHE_KEYS = {
  /**
   * Cache key for storing user's followed source IDs
   */
  USER_FOLLOWED_SOURCES: (userId: string) => `user:followed-sources:${userId}`,

  /**
   * Redis sorted set key for tracking active users per source
   * Score: Unix timestamp
   * Member: user:{userId}
   */
  ACTIVE_USERS_BY_SOURCE: (sourceId: string) =>
    `active_users:source:${sourceId}`,
} as const;
