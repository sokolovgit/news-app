import { Inject, Injectable } from '@nestjs/common';

import {
  eq,
  sql,
  inArray,
  and,
  or,
  gte,
  lte,
  ilike,
  desc,
  asc,
} from 'drizzle-orm';

import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CONNECTION, drizzle } from '@/database';

import { RawPostsRepository, GetFeedPostsParams } from '../abstracts';
import { DrizzleRawPostsEntityMapper } from './mappers';
import { createPaginatedResult, PaginatedResult } from '@/commons/types';

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

  async getFeedPosts(
    params: GetFeedPostsParams,
    loadOptions: RawPostLoadOptions = {},
  ): Promise<PaginatedResult<RawPost>> {
    const conditions = [];

    // Filter by source IDs
    if (params.sourceIds.length > 0) {
      conditions.push(inArray(rawPosts.sourceId, params.sourceIds));
    }

    // Search in title and content
    if (params.search) {
      const searchPattern = `%${params.search}%`;
      conditions.push(
        or(
          params.search ? ilike(rawPosts.title, searchPattern) : undefined,
          // Search in JSONB content - using PostgreSQL JSONB operators
          sql`${rawPosts.content}::text ILIKE ${searchPattern}`,
        )!,
      );
    }

    // Date range filters
    if (params.dateFrom) {
      conditions.push(gte(rawPosts.createdAt, params.dateFrom));
    }

    if (params.dateTo) {
      conditions.push(lte(rawPosts.createdAt, params.dateTo));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Build sort order
    const sortField =
      params.sort?.field === 'updatedAt'
        ? rawPosts.updatedAt
        : rawPosts.createdAt;
    const orderBy =
      params.sort?.order === 'asc' ? asc(sortField) : desc(sortField);

    // Get total count
    const totalResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(rawPosts)
      .where(whereClause);

    const total = Number(totalResult[0]?.count ?? 0);

    // Get paginated data
    const postsData = await this.db.query.rawPosts.findMany({
      where: whereClause,
      with: this.buildRelations(loadOptions),
      orderBy: [orderBy],
      limit: params.limit,
      offset: params.offset,
    });

    const posts = postsData.map((post) =>
      DrizzleRawPostsEntityMapper.toEntity(post, loadOptions),
    );

    return createPaginatedResult(posts, total, {
      offset: params.offset,
      limit: params.limit,
    });
  }

  private buildRelations(relations?: RawPostLoadOptions) {
    return {
      ...(relations?.withSource && { source: true }),
    } as Record<string, boolean | undefined>;
  }
}
