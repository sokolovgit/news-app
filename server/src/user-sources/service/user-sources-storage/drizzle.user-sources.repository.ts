import { Inject, Injectable } from '@nestjs/common';

import { and, eq, count, ilike, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CONNECTION, drizzle } from '@/database';

import {
  UserSourcesRepository,
  UserSourcesFilterParams,
} from '../abstracts';
import { DrizzleUserSourcesEntityMapper } from './mappers';

import { UserId } from '@/users/domain/schemas';
import { SourceId, sources } from '@/sources/domain/schemas';
import { userSources } from '@/user-sources/domain/schemas';
import {
  UserSource,
  UserSourceLoadOptions,
} from '@/user-sources/domain/entities';
import {
  PaginatedResult,
  PaginationParams,
  createPaginatedResult,
} from '@/commons/types';
import { PublicSource } from '@/sources/domain/enums';

@Injectable()
export class DrizzleUserSourcesRepository extends UserSourcesRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: NodePgDatabase<typeof drizzle>,
  ) {
    super();
  }

  async findByUserAndSource(
    userId: UserId,
    sourceId: SourceId,
    loadOptions: UserSourceLoadOptions = {},
  ): Promise<UserSource | null> {
    const link = await this.db.query.userSources.findFirst({
      where: and(
        eq(userSources.userId, userId),
        eq(userSources.sourceId, sourceId),
      ),
      with: this.buildRelations(loadOptions),
    });

    return link
      ? DrizzleUserSourcesEntityMapper.toEntity(link, loadOptions)
      : null;
  }

  async save(userSource: UserSource): Promise<UserSource | null> {
    const schema = DrizzleUserSourcesEntityMapper.toSchema(userSource);

    const [saved] = await this.db
      .insert(userSources)
      .values(schema)
      .returning();

    return saved ? DrizzleUserSourcesEntityMapper.toEntity(saved) : null;
  }

  async findAllSourceIdsByUser(userId: UserId): Promise<SourceId[]> {
    const links = await this.db.query.userSources.findMany({
      where: eq(userSources.userId, userId),
      columns: {
        sourceId: true,
      },
    });

    const sourceIds: SourceId[] = links.map(
      (link): SourceId => link.sourceId as SourceId,
    );
    return sourceIds;
  }

  async findAllByUser(
    userId: UserId,
    loadOptions: UserSourceLoadOptions = {},
  ): Promise<UserSource[]> {
    const links = await this.db.query.userSources.findMany({
      where: eq(userSources.userId, userId),
      with: this.buildRelations(loadOptions),
    });

    return links.map((link) =>
      DrizzleUserSourcesEntityMapper.toEntity(link, loadOptions),
    );
  }

  async findAllByUserPaginated(
    userId: UserId,
    params: PaginationParams,
    loadOptions: UserSourceLoadOptions = {},
  ): Promise<PaginatedResult<UserSource>> {
    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(userSources)
      .where(eq(userSources.userId, userId));

    const total = totalResult?.count ?? 0;

    // Get paginated data
    const links = await this.db.query.userSources.findMany({
      where: eq(userSources.userId, userId),
      with: this.buildRelations(loadOptions),
      limit: params.limit,
      offset: params.offset,
    });

    const data = links.map((link) =>
      DrizzleUserSourcesEntityMapper.toEntity(link, loadOptions),
    );

    return createPaginatedResult(data, total, params);
  }

  async findAllByUserPaginatedFiltered(
    userId: UserId,
    params: PaginationParams,
    loadOptions: UserSourceLoadOptions = {},
    filters?: UserSourcesFilterParams,
  ): Promise<PaginatedResult<UserSource>> {
    // Build base conditions
    const conditions = [eq(userSources.userId, userId)];

    // If we have filters, we need to join with sources table
    if (filters?.search || filters?.sourceType) {
      // Use raw SQL query with join for filtered results
      const searchPattern = filters?.search ? `%${filters.search}%` : null;

      // Build WHERE clause
      const whereConditions: string[] = ['us.user_id = $1'];
      const queryParams: (string | number)[] = [userId];
      let paramIndex = 2;

      if (searchPattern) {
        whereConditions.push(`s.name ILIKE $${paramIndex}`);
        queryParams.push(searchPattern);
        paramIndex++;
      }

      if (filters?.sourceType) {
        whereConditions.push(`s.source = $${paramIndex}`);
        queryParams.push(filters.sourceType);
        paramIndex++;
      }

      // Add isBanned filter
      whereConditions.push('s.is_banned = false');

      const whereClause = whereConditions.join(' AND ');

      // Get total count with filters
      const countQuery = `
        SELECT COUNT(*) as count
        FROM user_sources us
        INNER JOIN sources s ON us.source_id = s.id
        WHERE ${whereClause}
      `;

      const countResult = await this.db.execute(
        sql.raw(`${countQuery.replace(/\$(\d+)/g, (_, num) => `'${queryParams[parseInt(num) - 1]}'`)}`),
      );
      const total = Number((countResult.rows[0] as { count: string })?.count ?? 0);

      // Get paginated data with filters
      const dataQuery = `
        SELECT us.id, us.user_id, us.source_id, us.created_at, us.updated_at
        FROM user_sources us
        INNER JOIN sources s ON us.source_id = s.id
        WHERE ${whereClause}
        ORDER BY us.created_at DESC
        LIMIT ${params.limit}
        OFFSET ${params.offset}
      `;

      const dataResult = await this.db.execute(
        sql.raw(`${dataQuery.replace(/\$(\d+)/g, (_, num) => `'${queryParams[parseInt(num) - 1]}'`)}`),
      );

      // Fetch full user sources with relations for the filtered IDs
      const userSourceIds = (dataResult.rows as { id: string }[]).map((r) => r.id);

      if (userSourceIds.length === 0) {
        return createPaginatedResult([], total, params);
      }

      const links = await this.db.query.userSources.findMany({
        where: sql`${userSources.id} IN (${sql.join(userSourceIds.map((id) => sql`${id}`), sql`, `)})`,
        with: this.buildRelations(loadOptions),
      });

      const data = links.map((link) =>
        DrizzleUserSourcesEntityMapper.toEntity(link, loadOptions),
      );

      return createPaginatedResult(data, total, params);
    }

    // No filters, use the simpler query
    return this.findAllByUserPaginated(userId, params, loadOptions);
  }

  async getDistinctSourceTypesByUser(userId: UserId): Promise<PublicSource[]> {
    const result = await this.db.execute(
      sql`
        SELECT DISTINCT s.source
        FROM user_sources us
        INNER JOIN sources s ON us.source_id = s.id
        WHERE us.user_id = ${userId} AND s.is_banned = false
        ORDER BY s.source
      `,
    );

    return (result.rows as { source: string }[]).map(
      (row) => row.source as PublicSource,
    );
  }

  private buildRelations(loadOptions: UserSourceLoadOptions) {
    return {
      ...(loadOptions.withUser && { user: true }),
      ...(loadOptions.withSource && { source: true }),
    } as Record<string, boolean | undefined>;
  }
}
