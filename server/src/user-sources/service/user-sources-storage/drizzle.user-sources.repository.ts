import { Inject, Injectable } from '@nestjs/common';

import { and, eq, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CONNECTION, drizzle } from '@/database';

import { UserSourcesRepository } from '../abstracts';
import { DrizzleUserSourcesEntityMapper } from './mappers';

import { UserId } from '@/users/domain/schemas';
import { SourceId } from '@/sources/domain/schemas';
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

  private buildRelations(loadOptions: UserSourceLoadOptions) {
    return {
      ...(loadOptions.withUser && { user: true }),
      ...(loadOptions.withSource && { source: true }),
    } as Record<string, boolean | undefined>;
  }
}
