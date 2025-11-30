import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { CacheService } from '@/commons/cache';
import { SourcesService } from '@/sources/service/sources-service';
import { RawPostsService } from '@/raw-posts/service/raw-posts-service';
import { RawPostFactory } from '@/raw-posts/domain/factories';
import { ContentBlockType } from '@/raw-posts/domain/enums';
import { Content } from '@/raw-posts/domain/types';

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

    // Parse and split text content into blocks
    if (post.content) {
      const textBlocks = this.parseTextContent(post.content);
      content.push(...textBlocks);
    }

    // Add media URLs as appropriate blocks based on file extension
    for (const mediaUrl of post.mediaUrls || []) {
      const mediaBlock = this.createMediaBlock(mediaUrl);
      content.push(mediaBlock);
    }

    return content;
  }

  /**
   * Parse text content into multiple content blocks
   * Splits by paragraphs (double newlines) and detects headers
   */
  private parseTextContent(text: string): Content {
    const blocks: Content = [];

    // Normalize line endings and split by double newlines (paragraph breaks)
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const paragraphs = normalizedText.split(/\n\n+/);

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;

      // Check if this paragraph contains multiple lines (could be a list or structured content)
      const lines = trimmed.split('\n');

      if (lines.length === 1) {
        // Single line - check if it's a header
        const block = this.parseLineAsBlock(trimmed);
        blocks.push(block);
      } else {
        // Multiple lines in same paragraph - process each line
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          const block = this.parseLineAsBlock(trimmedLine);
          blocks.push(block);
        }
      }
    }

    return blocks;
  }

  /**
   * Parse a single line and determine if it's a header or paragraph
   */
  private parseLineAsBlock(line: string):
    | {
        type: ContentBlockType.HEADER;
        data: { text: string; level: 1 | 2 | 3 };
      }
    | { type: ContentBlockType.PARAGRAPH; data: { text: string } } {
    // Check for Markdown-style headers (# Header)
    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headerMatch) {
      const level = Math.min(headerMatch[1].length, 3) as 1 | 2 | 3;
      return {
        type: ContentBlockType.HEADER,
        data: { text: headerMatch[2].trim(), level },
      };
    }

    // Check for bold text that looks like a header (short line, all caps or title case)
    // Common patterns: **Title**, __Title__, TITLE IN CAPS
    const boldMatch = line.match(/^(?:\*\*|__)(.+?)(?:\*\*|__)$/);
    if (boldMatch && boldMatch[1].length <= 100) {
      return {
        type: ContentBlockType.HEADER,
        data: { text: boldMatch[1].trim(), level: 2 },
      };
    }

    // Check for ALL CAPS short lines (likely headers in social media)
    if (
      line.length <= 80 &&
      line === line.toUpperCase() &&
      /[A-ZА-ЯІЇЄҐ]/.test(line)
    ) {
      return {
        type: ContentBlockType.HEADER,
        data: { text: line, level: 2 },
      };
    }

    // Default: regular paragraph
    return {
      type: ContentBlockType.PARAGRAPH,
      data: { text: line },
    };
  }

  /**
   * Create a properly typed media block based on URL/file extension
   */
  private createMediaBlock(
    url: string,
  ):
    | { type: ContentBlockType.IMAGE; data: { url: string } }
    | { type: ContentBlockType.VIDEO; data: { url: string } }
    | { type: ContentBlockType.AUDIO; data: { url: string } } {
    // Extract extension from URL (handle query params)
    const urlWithoutParams = url.split('?')[0];
    const extension = urlWithoutParams.split('.').pop()?.toLowerCase() || '';

    // Video extensions
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v', 'wmv'];
    if (videoExtensions.includes(extension)) {
      return { type: ContentBlockType.VIDEO, data: { url } };
    }

    // Audio extensions
    const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma'];
    if (audioExtensions.includes(extension)) {
      return { type: ContentBlockType.AUDIO, data: { url } };
    }

    // Default to image for all other extensions (jpg, jpeg, png, gif, webp, etc.)
    return { type: ContentBlockType.IMAGE, data: { url } };
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
