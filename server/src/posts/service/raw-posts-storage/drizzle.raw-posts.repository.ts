import { Inject, Injectable } from '@nestjs/common';

import { eq, sql, inArray } from 'drizzle-orm';

import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CONNECTION, drizzle } from '@/database';

import { RawPostsRepository } from '../abstracts';
import { DrizzleRawPostsEntityMapper } from './mappers';

import { SourceId } from '@/sources/domain/schemas';
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
      .onConflictDoUpdate({
        target: [rawPosts.sourceId, rawPosts.externalId],
        set: {
          title: sql`EXCLUDED.title`,
          content: sql`EXCLUDED.content`,
          updatedAt: sql`NOW()`,
        },
      })
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
      .onConflictDoUpdate({
        target: [rawPosts.sourceId, rawPosts.externalId],
        set: {
          title: sql`EXCLUDED.title`,
          content: sql`EXCLUDED.content`,
          updatedAt: sql`NOW()`,
        },
      })
      .returning();

    return savedRawPosts.map((savedRawPost) =>
      DrizzleRawPostsEntityMapper.toEntity(savedRawPost),
    );
  }

  async existsByExternalIds(
    sourceId: SourceId,
    externalIds: string[],
  ): Promise<Set<string>> {
    if (externalIds.length === 0) {
      return new Set();
    }

    const existingPosts = await this.db.query.rawPosts.findMany({
      where: (rawPosts, { eq, and }) =>
        and(
          eq(rawPosts.sourceId, sourceId),
          inArray(rawPosts.externalId, externalIds),
        ),
      columns: {
        externalId: true,
      },
    });

    return new Set(existingPosts.map((post) => post.externalId));
  }

  private buildRelations(relations?: RawPostLoadOptions) {
    return {
      ...(relations?.withSource && { source: true }),
    } as Record<string, boolean | undefined>;
  }
}
