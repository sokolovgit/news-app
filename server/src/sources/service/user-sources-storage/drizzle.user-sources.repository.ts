import { Inject, Injectable } from '@nestjs/common';

import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { UserSourcesRepository } from '../abstracts';
import { DrizzleUserSourcesEntityMapper } from './mappers';

import { UserSource, UserSourceLoadOptions } from '@/sources/domain/entities';
import { SourceId, userSources } from '@/sources/domain/schemas';
import { UserId } from '@/users/domain/schemas';

import { DRIZZLE_CONNECTION, drizzle } from '@/database';

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

  private buildRelations(loadOptions: UserSourceLoadOptions) {
    return {
      ...(loadOptions.withUser && { user: true }),
      ...(loadOptions.withSource && { source: true }),
    } as Record<string, boolean | undefined>;
  }
}
