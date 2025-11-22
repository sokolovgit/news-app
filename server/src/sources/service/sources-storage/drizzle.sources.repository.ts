import { Inject, Injectable } from '@nestjs/common';

import { eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CONNECTION, drizzle } from '@/database';

import {
  PaginatedResult,
  PaginationParams,
  createPaginatedResult,
} from '@/commons/types';

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

  async findAll(loadOptions: SourceLoadOptions = {}): Promise<Source[]> {
    const allSources = await this.db.query.sources.findMany({
      with: this.buildRelations(loadOptions),
    });

    return allSources.map((source) =>
      DrizzleSourcesEntityMapper.toEntity(source, loadOptions),
    );
  }

  async findAllPaginated(
    params: PaginationParams,
    loadOptions: SourceLoadOptions = {},
  ): Promise<PaginatedResult<Source>> {
    const result = await this.db.query.sources.findMany({
      offset: params.offset,
      limit: params.limit,
      with: this.buildRelations(loadOptions),
      extras: {
        total: sql<number>`count(*) over()`.as('total'),
      },
    });

    const total = result[0]?.total ?? 0;

    const data = result.map((source) =>
      DrizzleSourcesEntityMapper.toEntity(source, loadOptions),
    );

    return createPaginatedResult(data, total, params);
  }

  async updateMetadata(
    sourceId: SourceId,
    metadata: {
      lastFetchedAt?: Date;
      cursor?: string | null;
      lastError?: string | null;
      status?: 'active' | 'paused' | 'error';
      fetchMetadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (metadata.lastFetchedAt !== undefined) {
      updateData.lastFetchedAt = metadata.lastFetchedAt;
    }

    if (metadata.cursor !== undefined) {
      updateData.cursor = metadata.cursor;
    }

    if (metadata.lastError !== undefined) {
      updateData.lastError = metadata.lastError;
    }

    if (metadata.status !== undefined) {
      updateData.status = metadata.status;
    }

    if (metadata.fetchMetadata !== undefined) {
      updateData.fetchMetadata = metadata.fetchMetadata;
    }

    await this.db
      .update(sources)
      .set(updateData)
      .where(eq(sources.id, sourceId));
  }

  private buildRelations(relations?: SourceLoadOptions) {
    return {
      ...(relations?.withAddedBy && { addedBy: true }),
    } as Record<string, boolean | undefined>;
  }
}
