import { Inject, Injectable } from '@nestjs/common';

import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CONNECTION, drizzle } from '@/database';

import { RawPostsRepository } from '../abstracts';
import { DrizzleRawPostsEntityMapper } from './mappers';

import { RawPostId, rawPosts } from '@/posts/domain/schemas';
import { RawPost, RawPostLoadOptions } from '@/posts/domain/entities';

@Injectable()
export class DrizzleRawPostsRepository extends RawPostsRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION) private db: NodePgDatabase<typeof drizzle>,
  ) {
    super();
  }

  async getRawPostById(
    id: RawPostId,
    relations: RawPostLoadOptions = {},
  ): Promise<RawPost | null> {
    const rawPost = await this.db.query.rawPosts.findFirst({
      where: eq(rawPosts.id, id),
      with: this.buildRelations(relations),
    });

    return rawPost
      ? DrizzleRawPostsEntityMapper.toEntity(rawPost, relations)
      : null;
  }

  async save(rawPost: RawPost): Promise<RawPost | null> {
    const rawPostData = DrizzleRawPostsEntityMapper.toSchema(rawPost);

    const [savedRawPost] = await this.db
      .insert(rawPosts)
      .values(rawPostData)
      .returning();

    return savedRawPost
      ? DrizzleRawPostsEntityMapper.toEntity(savedRawPost)
      : null;
  }

  async saveMany(rawPostEntities: RawPost[]): Promise<RawPost[]> {
    if (rawPostEntities.length === 0) {
      return [];
    }

    const rawPostsData = rawPostEntities.map((rawPost) =>
      DrizzleRawPostsEntityMapper.toSchema(rawPost),
    );

    const savedRawPosts = await this.db
      .insert(rawPosts)
      .values(rawPostsData)
      .returning();

    return savedRawPosts.map((savedRawPost) =>
      DrizzleRawPostsEntityMapper.toEntity(savedRawPost),
    );
  }

  private buildRelations(relations?: RawPostLoadOptions) {
    return {
      ...(relations?.withSource && { source: true }),
    } as Record<string, boolean | undefined>;
  }
}
