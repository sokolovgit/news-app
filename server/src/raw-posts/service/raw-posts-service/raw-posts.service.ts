import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { PaginatedResult } from '@/commons/types';

import { RawPostId } from '@/raw-posts/domain/schemas';
import { RawPost, RawPostLoadOptions } from '@/raw-posts/domain/entities';
import { RawPostPayload } from '@/raw-posts/domain/types';
import { RawPostFactory } from '@/raw-posts/domain/factories';
import { RawPostsRepository, GetRawPostsParams } from '../abstracts';
import {
  RawPostSaveFailedError,
  RawPostSaveManyFailedError,
} from '@/raw-posts/domain/errors';

import { SourceId } from '@/sources/domain/schemas';

@Injectable()
export class RawPostsService {
  constructor(
    private readonly logger: LoggerService,
    private readonly rawPostsRepository: RawPostsRepository,
  ) {}

  async getRawPostById(
    id: RawPostId,
    loadOptions: RawPostLoadOptions = {},
  ): Promise<RawPost | null> {
    this.logger.log(
      `Getting raw post by ID: ${id} with load options: ${JSON.stringify(loadOptions)}`,
    );

    const rawPost = await this.rawPostsRepository.getRawPostById(
      id,
      loadOptions,
    );

    if (!rawPost) {
      this.logger.log(`Raw post not found with ID: ${id}`);
      return null;
    }

    this.logger.log(`Raw post found with ID: ${id}`);

    return rawPost;
  }

  async saveRawPostOrThrow(rawPost: RawPost): Promise<RawPost> {
    this.logger.log(`Saving raw post with ID: ${rawPost.getId()}`);

    const savedRawPost = await this.rawPostsRepository.save(rawPost);

    if (!savedRawPost) {
      this.logger.error(`Failed to save raw post with ID: ${rawPost.getId()}`);
      throw new RawPostSaveFailedError(rawPost.getId());
    }

    this.logger.log(`Raw post saved with ID: ${savedRawPost.getId()}`);

    return savedRawPost;
  }

  async saveManyRawPostsOrThrow(rawPosts: RawPost[]): Promise<RawPost[]> {
    this.logger.log(`Saving ${rawPosts.length} ${RawPost.name} entities`);

    const savedRawPosts = await this.rawPostsRepository.saveMany(rawPosts);

    if (!savedRawPosts) {
      this.logger.error(`Failed to save many raw posts`);
      throw new RawPostSaveManyFailedError(
        rawPosts.map((rawPost) => rawPost.getExternalId()),
      );
    }

    this.logger.log(`Saved ${savedRawPosts.length} raw posts`);

    return savedRawPosts;
  }

  async saveManyRawPostsPayloadsOrThrow(
    rawPostsPayloads: RawPostPayload[],
    sourceId: SourceId,
  ): Promise<RawPost[]> {
    this.logger.log(
      `Mapping ${rawPostsPayloads.length} raw posts payloads to ${RawPost.name} entities`,
    );

    const rawPosts = rawPostsPayloads.map((rawPostPayload) =>
      RawPostFactory.fromPayload(rawPostPayload, sourceId),
    );

    return this.saveManyRawPostsOrThrow(rawPosts);
  }

  async existsByExternalIds(
    sourceId: SourceId,
    externalIds: string[],
  ): Promise<Set<string>> {
    return this.rawPostsRepository.existsByExternalIds(sourceId, externalIds);
  }

  async getRawPosts(
    params: GetRawPostsParams,
    loadOptions: RawPostLoadOptions = {},
  ): Promise<PaginatedResult<RawPost>> {
    const logParams = {
      search: params.search,
      sort: params.sort,
      offset: params.offset,
      limit: params.limit,
    };

    this.logger.log(
      `Getting raw posts with params: ${JSON.stringify(logParams)}`,
    );

    return await this.rawPostsRepository.getRawPosts(params, loadOptions);
  }

  async banPost(postId: RawPostId): Promise<void> {
    this.logger.log(`Banning post with ID: ${postId}`);

    await this.rawPostsRepository.banPost(postId);

    this.logger.log(`Post ${postId} banned successfully`);
  }

  async getMostRecentPostDate(sourceIds: SourceId[]): Promise<Date | null> {
    this.logger.debug(
      `Getting most recent post date for ${sourceIds.length} sources`,
    );

    return await this.rawPostsRepository.getMostRecentPostDate(sourceIds);
  }
}
