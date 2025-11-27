import { Injectable } from '@nestjs/common';
import { Api } from 'telegram';

import { LoggerService } from '@/logger';
import { generateMediaKey } from '@/commons/s3';
import { MediaUploadQueueService, MediaUploadJobData } from '@/media';

import { SourcesService } from '../sources-service';
import { TelegramService } from '../telegram-serivce';
import { CollectorService } from './interfaces/collector-service.interface';

import { FetchedPost } from '../sources-result/types';
import { CollectorJobData } from '../sources-orchestrator/types';
import { SourceNotFoundError } from '@/sources/domain/errors';
import { SourcesResultQueueService } from '../sources-result-queue';

@Injectable()
export class TelegramCollectorService implements CollectorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly sourcesService: SourcesService,
    private readonly telegramService: TelegramService,
    private readonly resultsQueueService: SourcesResultQueueService,
    private readonly mediaUploadQueueService: MediaUploadQueueService,
  ) {}

  /**
   * Process a collector job: fetch posts, download media, and create result job
   */
  async processJob(
    jobData: CollectorJobData,
    collectorJobId: string,
    startTime: number,
  ): Promise<void> {
    const { sourceId, sourceType, metadata, priority, limit } = jobData;

    try {
      // 1. Load source entity
      const source = await this.sourcesService.getSourceById(sourceId);
      if (!source) {
        throw new SourceNotFoundError(sourceId);
      }

      this.logger.log(
        `Collecting Telegram source ${sourceId}, limit=${limit ?? 50}`,
      );

      // 2. Fetch messages from Telegram
      const messages = await this.telegramService.fetchChannelMessages(
        source.getUrl(),
        limit ?? 50,
      );

      // 3. Process each message: download media and create posts
      const posts: FetchedPost[] = [];
      const mediaUploadJobs: MediaUploadJobData[] = [];

      for (const message of messages) {
        const { post, mediaJobs } = await this.processMessage(
          message,
          sourceId,
        );
        posts.push(post);
        mediaUploadJobs.push(...mediaJobs);
      }

      // 4. Queue media upload jobs in bulk
      if (mediaUploadJobs.length > 0) {
        await this.mediaUploadQueueService.addBulkJobs(mediaUploadJobs);
        this.logger.debug(
          `Queued ${mediaUploadJobs.length} media uploads for source ${sourceId}`,
      );
      }

      const processingTime = Date.now() - startTime;

      // 5. Create success result job
      await this.resultsQueueService.createSuccessResultJob({
        sourceId,
        sourceType,
        metadata,
        collectorJobId,
        posts,
        nextCursor: undefined, // Telegram doesn't use cursor-based pagination
        processingTime,
        priority,
      });

      this.logger.log(
        `Successfully processed Telegram collector job ${collectorJobId} for source ${sourceId}: ${posts.length} posts, ${mediaUploadJobs.length} media files in ${processingTime}ms`,
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorInstance =
        error instanceof Error ? error : new Error(String(error));

      this.logger.error(
        `Failed to process Telegram collector job ${collectorJobId} for source ${sourceId}: ${errorInstance.message}`,
        errorInstance.stack,
      );

      // Create error result job
      await this.resultsQueueService.createErrorResultJob({
        sourceId,
        sourceType,
        metadata,
        collectorJobId,
        error: errorInstance,
        processingTime,
        priority,
      });

      throw errorInstance; // Re-throw to trigger BullMQ retry
    }
  }

  /**
   * Process a single message: extract content and download media.
   */
  private async processMessage(
    message: Api.Message,
    sourceId: string,
  ): Promise<{ post: FetchedPost; mediaJobs: MediaUploadJobData[] }> {
    const externalId = String(message.id);
    const mediaUrls: string[] = [];
    const mediaJobs: MediaUploadJobData[] = [];

    // Check for media and download
    if (message.media) {
      const downloadedMedia = await this.telegramService.downloadMedia(message);

      if (downloadedMedia) {
        const mediaIndex = 1;
        const s3Key = generateMediaKey(
          'telegram',
          sourceId,
          externalId,
          mediaIndex,
          downloadedMedia.extension,
        );

        // Add S3 path to post
        mediaUrls.push(s3Key);

        // Create upload job with base64 buffer
        mediaJobs.push({
          sourceType: 'telegram',
          sourceId,
          postExternalId: externalId,
          mediaIndex,
          targetPath: s3Key,
          contentType: downloadedMedia.contentType,
          source: 'buffer',
          buffer: downloadedMedia.buffer.toString('base64'),
        });
      }
    }

    // Extract author information
    const author = {
      username: message.postAuthor?.toString() || 'unknown',
      displayName: message.postAuthor?.toString() || 'Unknown',
      avatarUrl: undefined,
    };

    // Extract metrics
    const metrics = {
      likes: message.reactions ? message.reactions.results.length : undefined,
      comments: undefined,
      shares: undefined,
    };

    const publishedAt = message.date
      ? new Date(message.date * 1000).toISOString()
      : new Date().toISOString();

    const post: FetchedPost = {
      externalId,
      content: message.message || '',
      mediaUrls,
      publishedAt,
      author,
      metrics,
    };

    return { post, mediaJobs };
  }
}
