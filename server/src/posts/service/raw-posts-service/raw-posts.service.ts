import { Injectable } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { RawPostsRepository } from '../abstracts';
import { RawPostId } from '@/posts/domain/schemas';
import { RawPost, RawPostLoadOptions } from '@/posts/domain/entities';
import {
  RawPostSaveFailedError,
  RawPostSaveManyFailedError,
} from '@/posts/domain/errors';

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
    this.logger.log(`Saving ${rawPosts.length} raw posts`);

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
}
