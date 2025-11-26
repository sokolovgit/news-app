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
  SQL,
} from 'drizzle-orm';

import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CONNECTION, drizzle } from '@/database';

import { RawPostsRepository, GetRawPostsParams } from '../abstracts';
import { DrizzleRawPostsEntityMapper } from './mappers';
import {
  createPaginatedResult,
  PaginatedResult,
  SortOrder,
} from '@/commons/types';

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

  async getRawPosts(
    params: GetRawPostsParams,
    loadOptions: RawPostLoadOptions = {},
  ): Promise<PaginatedResult<RawPost>> {
    const conditions = [];

    if (params.search) {
      const searchPattern = `%${params.search}%`;

      conditions.push(
        or(
          params.search ? ilike(rawPosts.title, searchPattern) : undefined,
          sql`${rawPosts.content}::text ILIKE ${searchPattern}`,
        )!,
      );
    }

    if (params.dateFrom) {
      conditions.push(gte(rawPosts.createdAt, params.dateFrom));
    }

    if (params.dateTo) {
      conditions.push(lte(rawPosts.createdAt, params.dateTo));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const sortField =
      params.sort?.field === 'createdAt' ? rawPosts.createdAt : undefined;

    let orderByClause: SQL[] | undefined = undefined;

    if (params.sort?.order && sortField) {
      orderByClause = [
        params.sort?.order === SortOrder.ASC ? asc(sortField) : desc(sortField),
      ];
    }

    const postsData = await this.db.query.rawPosts.findMany({
      where: whereClause,
      orderBy: orderByClause,
      with: this.buildRelations(loadOptions),
      limit: params.limit,
      offset: params.offset,
      extras: {
        total: sql<number>`count(*) over()`.as('total'),
      },
    });

    const total = postsData[0]?.total ?? 0;

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
