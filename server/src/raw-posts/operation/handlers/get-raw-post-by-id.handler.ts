import { Injectable, NotFoundException } from '@nestjs/common';

import { LoggerService } from '@/logger';
import { RawPostsService } from '@/raw-posts/service/raw-posts-service';
import { RawPost } from '@/raw-posts/domain/entities';

import { GetRawPostByIdRequest } from '../requests';

@Injectable()
export class GetRawPostByIdHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly rawPostsService: RawPostsService,
  ) {}

  async handle(request: GetRawPostByIdRequest): Promise<RawPost> {
    this.logger.debug(
      `Getting raw post by ID: ${request.postId} for user: ${request.userId}`,
    );

    const rawPost = await this.rawPostsService.getRawPostById(request.postId, {
      withSource: true,
    });

    if (!rawPost) {
      this.logger.warn(`Raw post not found: ${request.postId}`);
      throw new NotFoundException(`Post with ID ${request.postId} not found`);
    }

    this.logger.debug(`Raw post found: ${request.postId}`);

    return rawPost;
  }
}
