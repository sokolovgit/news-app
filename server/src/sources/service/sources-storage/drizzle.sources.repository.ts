import { Inject, Injectable } from '@nestjs/common';

import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CONNECTION, drizzle } from '@/database';

import { SourcesRepository } from '../abstracts';
import { DrizzleSourcesEntityMapper } from './mappers';

import { SourceId, sources } from '@/sources/domain/schemas';
import { Source, SourceLoadOptions } from '@/sources/domain/entities';

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

  async getSourceByUrl(
    url: string,
    relations: SourceLoadOptions = {},
  ): Promise<Source | null> {
    const source = await this.db.query.sources.findFirst({
      where: eq(sources.url, url),
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
