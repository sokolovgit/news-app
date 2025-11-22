import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { CacheService } from '@/commons/cache';
import { SourcesService } from '@/sources/service/sources-service';
import { RawPostsService } from '@/posts/service/raw-posts-service';
import { RawPostFactory } from '@/posts/domain/factories';
import { ContentBlockType } from '@/posts/domain/enums';
import { Content } from '@/posts/domain/types';

import { SourceId } from '@/sources/domain/schemas';
import { SourceStatus } from '@/sources/domain/enums';
import { ResultJobData, FetchedPost } from './types';

@Injectable()
export class SourcesResultService {
  constructor(
    private readonly logger: LoggerService,
    private readonly sourcesService: SourcesService,
    private readonly rawPostsService: RawPostsService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Process result job: store posts, update cache, update source metadata
   */
  async processResultJob(jobData: ResultJobData): Promise<void> {
    const { sourceId, status, posts, nextCursor, error } = jobData;

    this.logger.debug(
      `Processing result job for source ${sourceId}, status=${status}, postsCount=${posts?.length || 0}`,
    );

    if (status === 'error') {
      await this.handleError(sourceId, error!);
      return;
    }

    if (!posts || posts.length === 0) {
      this.logger.debug(`No posts to process for source ${sourceId}`);
      await this.updateSourceMetadata(sourceId, {
        lastFetchedAt: new Date(),
        cursor: nextCursor,
        lastFetchSuccess: true,
      });
      return;
    }

    // 1. Check for duplicate posts and filter new ones (efficient batch check)
    const newPosts = await this.filterNewPosts(sourceId, posts);

    if (newPosts.length === 0) {
      this.logger.debug(
        `All ${posts.length} posts for source ${sourceId} are duplicates`,
      );
      await this.updateSourceMetadata(sourceId, {
        lastFetchedAt: new Date(),
        cursor: nextCursor,
        lastFetchSuccess: true,
      });
      return;
    }

    // 2. Convert FetchedPost to RawPost format
    const rawPosts = newPosts.map((post) =>
      RawPostFactory.fromPayload(
        {
          externalId: post.externalId,
          title: this.extractTitle(post.content),
          content: this.convertToContent(post),
        },
        sourceId,
      ),
    );

    // 3. Store new posts in database
    await this.rawPostsService.saveManyRawPostsOrThrow(rawPosts);

    this.logger.debug(
      `Stored ${newPosts.length} new posts for source ${sourceId} (${posts.length - newPosts.length} duplicates skipped)`,
    );

    // 4. Update source metadata in database
    await this.updateSourceMetadata(sourceId, {
      lastFetchedAt: new Date(),
      cursor: nextCursor,
      lastFetchSuccess: true,
    });

    // 5. Update cache with new posts (5 minute TTL)
    await this.updateCache(sourceId, newPosts);
  }

  /**
   * Filter out posts that already exist in database (efficient batch check)
   */
  private async filterNewPosts(
    sourceId: SourceId,
    posts: FetchedPost[],
  ): Promise<FetchedPost[]> {
    if (posts.length === 0) {
      return [];
    }

    // Get all externalIds
    const externalIds = posts.map((post) => post.externalId);

    // Batch check which externalIds already exist
    const existingExternalIds = await this.rawPostsService.existsByExternalIds(
      sourceId,
      externalIds,
    );

    // Filter out existing posts
    return posts.filter((post) => !existingExternalIds.has(post.externalId));
  }

  /**
   * Convert FetchedPost to Content format
   */
  private convertToContent(post: FetchedPost): Content {
    const content: Content = [];

    // Add text content as paragraph
    if (post.content) {
      content.push({
        type: ContentBlockType.PARAGRAPH,
        data: { text: post.content },
      });
    }

    // Add media URLs as image/video blocks
    for (const mediaUrl of post.mediaUrls || []) {
      // Determine if it's a video based on URL or metadata
      // For now, assume all are images
      content.push({
        type: ContentBlockType.IMAGE,
        data: { url: mediaUrl },
      });
    }

    return content;
  }

  /**
   * Extract title from post content (first line or first 100 chars)
   */
  private extractTitle(content: string): string | undefined {
    if (!content) return undefined;

    const firstLine = content.split('\n')[0];
    if (firstLine.length <= 100) {
      return firstLine;
    }

    return firstLine.substring(0, 100) + '...';
  }

  /**
   * Update source metadata after fetch
   */
  private async updateSourceMetadata(
    sourceId: SourceId,
    metadata: {
      lastFetchedAt: Date;
      cursor?: string;
      lastFetchSuccess: boolean;
      lastError?: string;
      status?: SourceStatus;
    },
  ): Promise<void> {
    const status =
      metadata.status ??
      (metadata.lastFetchSuccess ? SourceStatus.ACTIVE : SourceStatus.ERROR);

    await this.sourcesService.updateMetadata(sourceId, {
      lastFetchedAt: metadata.lastFetchedAt,
      cursor: metadata.cursor ?? null,
      lastError: metadata.lastError ?? null,
      status,
    });

    this.logger.debug(
      `Updated metadata for source ${sourceId}: lastFetchedAt=${metadata.lastFetchedAt.toISOString()}, cursor=${metadata.cursor}, status=${status}`,
    );
  }

  /**
   * Handle error result
   */
  private async handleError(
    sourceId: SourceId,
    error: { code: string; message: string; retryable: boolean },
  ): Promise<void> {
    this.logger.error(
      `Fetch error for source ${sourceId}: ${error.code} - ${error.message}`,
    );

    // Determine if error is permanent (non-retryable)
    const isPermanentError = this.isPermanentError(error);

    await this.updateSourceMetadata(sourceId, {
      lastFetchedAt: new Date(),
      lastFetchSuccess: false,
      lastError: error.message,
      status: isPermanentError ? SourceStatus.PAUSED : SourceStatus.ERROR,
    });

    if (isPermanentError) {
      this.logger.warn(
        `Source ${sourceId} paused due to permanent error: ${error.code} - ${error.message}`,
      );
    }
  }

  /**
   * Determine if error is permanent (should pause source)
   */
  private isPermanentError(error: {
    code: string;
    message: string;
    retryable: boolean;
  }): boolean {
    // Permanent errors that should pause source fetching
    const permanentErrorCodes = [
      'PROFILE_NOT_FOUND_ERROR',
      'PRIVATE_PROFILE_ERROR',
      'ACCOUNT_SUSPENDED_ERROR',
      'AUTH_ERROR',
    ];

    return !error.retryable || permanentErrorCodes.includes(error.code);
  }

  /**
   * Update cache with new posts
   */
  private async updateCache(
    sourceId: SourceId,
    posts: FetchedPost[],
  ): Promise<void> {
    if (posts.length === 0) {
      return;
    }

    const cacheKey = `source:${sourceId}:posts`;
    const ttlSeconds = 300; // 5 minutes

    try {
      // Store posts in cache as JSON
      await this.cacheService.setJson(cacheKey, posts, ttlSeconds);

      // Also store cursor for pagination
      const cursorKey = `source:${sourceId}:cursor`;
      const lastPost = posts[posts.length - 1];
      await this.cacheService.set(cursorKey, lastPost.externalId, ttlSeconds);

      this.logger.debug(
        `Updated cache for source ${sourceId}: ${posts.length} posts, TTL=${ttlSeconds}s`,
      );
    } catch (error) {
      // Cache failures shouldn't block the main flow
      this.logger.warn(
        `Failed to update cache for source ${sourceId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
