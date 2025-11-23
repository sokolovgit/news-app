import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';

import { ConfigService } from '@/config';
import { LoggerService } from '@/logger';
import { SourcesRepository } from '@/sources/service/abstracts';

import { SourceQueue } from '@/sources/domain/queues';
import { PublicSource } from '@/sources/domain/enums';
import { OrchestratorJobData } from '../sources-orchestrator-queue/types';
import { CollectorJobData } from './types';

@Injectable()
export class SourcesOrchestratorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly sourcesRepository: SourcesRepository,
    @InjectQueue(SourceQueue.INSTAGRAM_FETCHER)
    private readonly instagramQueue: Queue<CollectorJobData>,
    @InjectQueue(SourceQueue.TELEGRAM_FETCHER)
    private readonly telegramQueue: Queue<CollectorJobData>,
  ) {}

  /**
   * Process orchestrator job: enrich with source metadata and route to appropriate collector queue
   */
  async processOrchestratorJob(
    jobData: OrchestratorJobData,
    orchestratorJobId: string,
  ): Promise<void> {
    const { sourceId, priority } = jobData;

    this.logger.debug(
      `Processing orchestrator job for source ${sourceId}, orchestratorJobId=${orchestratorJobId}`,
    );

    // 1. Load source metadata from database
    const source = await this.sourcesRepository.getSourceById(sourceId);

    if (!source) {
      this.logger.warn(`Source ${sourceId} not found, skipping orchestration`);
      return;
    }

    // 2. Check if source should be skipped (paused, error state, etc.)
    const isPaused = source.isPaused();
    if (isPaused) {
      this.logger.debug(`Source ${sourceId} is paused, skipping orchestration`);
      return;
    }

    // If source has error status, we can still try to fetch (might have recovered)
    // But log it for monitoring
    const hasError = source.hasError();
    if (hasError) {
      this.logger.warn(
        `Source ${sourceId} has error status, attempting fetch anyway`,
      );
    }

    // 3. Extract externalId from URL
    const sourceUrl = source.getUrl();
    const sourceType = source.getSource();
    const externalId = this.extractExternalId(sourceUrl, sourceType);

    // 4. Enrich job data with source metadata
    const cursor = source.getCursor();
    const fetchMetadata = source.getFetchMetadata();
    const enrichedJobData: CollectorJobData = {
      sourceId,
      sourceType,
      externalId,
      cursor: cursor ?? undefined, // Load cursor from source metadata
      limit: 50, // Default limit
      priority,
      metadata: {
        orchestratorJobId,
        scheduledAt: new Date(),
        sourceMetadata: {
          lastFetchedAt: source.getLastFetchedAt(),
          lastCursor: cursor ?? undefined,
          fetchConfig: fetchMetadata ?? {},
        },
      },
    };

    // 5. Route to appropriate collector queue
    await this.routeToCollectorQueue(enrichedJobData);

    this.logger.debug(
      `Successfully routed source ${sourceId} to ${source.getSource()} collector queue`,
    );
  }

  /**
   * Route enriched job to appropriate collector queue based on source type
   */
  private async routeToCollectorQueue(
    jobData: CollectorJobData,
  ): Promise<void> {
    const { sourceType, priority } = jobData;
    const queueConfig = this.getQueueConfig(sourceType);

    const jobOptions: JobsOptions = {
      priority,
      ...queueConfig,
    };

    switch (sourceType) {
      case PublicSource.INSTAGRAM:
        await this.instagramQueue.add('fetch-instagram', jobData, jobOptions);
        break;

      case PublicSource.TELEGRAM:
        await this.telegramQueue.add('fetch-telegram', jobData, jobOptions);
        break;

      default: {
        this.logger.error(`Unknown source type ${String(sourceType)}`);
        throw new Error(`Unknown source type ${String(sourceType)}`);
      }
    }
  }

  /**
   * Extract externalId from URL based on source type
   * For Instagram: extract username from URL
   * For Telegram: extract channel/username from URL
   */
  private extractExternalId(url: string, sourceType: PublicSource): string {
    switch (sourceType) {
      case PublicSource.INSTAGRAM: {
        // Extract username from Instagram URL
        // Examples: https://www.instagram.com/nasa/ -> nasa
        const instagramMatch = url.match(/instagram\.com\/([^/?#]+)/);
        return instagramMatch ? instagramMatch[1] : url;
      }

      case PublicSource.TELEGRAM: {
        // Extract channel/username from Telegram URL
        // Examples: https://t.me/channel -> channel
        const telegramMatch = url.match(/t\.me\/([^/?#]+)/);
        return telegramMatch ? telegramMatch[1] : url;
      }

      default:
        this.logger.error(`Unknown source type ${String(sourceType)}`);
        throw new Error(`Unknown source type ${String(sourceType)}`);
    }
  }

  /**
   * Get queue configuration for source type
   */
  private getQueueConfig(sourceType: PublicSource): JobsOptions {
    switch (sourceType) {
      case PublicSource.INSTAGRAM:
        return this.configService.bullmq[SourceQueue.INSTAGRAM_FETCHER];

      case PublicSource.TELEGRAM:
        return this.configService.bullmq[SourceQueue.TELEGRAM_FETCHER];

      default:
        this.logger.error(`Unknown source type ${String(sourceType)}`);
        throw new Error(`Unknown source type ${String(sourceType)}`);
    }
  }
}
