import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { DRIZZLE_CONNECTION, drizzle } from '@/database';
import { eq } from 'drizzle-orm';
import { SourcesRepository } from '../abstracts';
import { Source, SourceLoadOptions } from '@/sources/domain/entities';
import { SourceId, sources } from '@/sources/domain/schemas';
import { DrizzleSourcesEntityMapper } from './mappers';

@Injectable()
export class DrizzleSourcesRepository extends SourcesRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION) private db: NodePgDatabase<typeof drizzle>,
  ) {
    super();
  }

  async getSourceById(
    id: SourceId,
    relations: SourceLoadOptions = {},
  ): Promise<Source | null> {
    const source = await this.db.query.sources.findFirst({
      where: eq(sources.id, id),
      with: this.buildRelations(relations),
    });

    return source
      ? DrizzleSourcesEntityMapper.toEntity(source, relations)
      : null;
  }

  async save(source: Source): Promise<Source | null> {
    const sourceData = DrizzleSourcesEntityMapper.toSchema(source);

    const [savedSource] = await this.db
      .insert(sources)
      .values(sourceData)
      .returning();

    return savedSource
      ? DrizzleSourcesEntityMapper.toEntity(savedSource)
      : null;
  }

  private buildRelations(relations?: SourceLoadOptions) {
    return {
      ...(relations?.withAddedBy && { addedBy: true }),
    } as Record<string, boolean | undefined>;
  }
}
