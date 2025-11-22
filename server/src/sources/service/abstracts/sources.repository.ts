import { SourceId } from '@/sources/domain/schemas';
import { Source, SourceLoadOptions } from '@/sources/domain/entities';
import { SourceStatus } from '@/sources/domain/enums';
import { PaginatedResult, PaginationParams } from '@/commons/types';

export abstract class SourcesRepository {
  abstract getSourceById(
    id: SourceId,
    relations?: SourceLoadOptions,
  ): Promise<Source | null>;

  abstract getSourceByUrl(
    url: string,
    relations?: SourceLoadOptions,
  ): Promise<Source | null>;

  abstract save(source: Source): Promise<Source | null>;

  abstract findAll(loadOptions?: SourceLoadOptions): Promise<Source[]>;

  abstract findAllPaginated(
    params: PaginationParams,
    loadOptions?: SourceLoadOptions,
  ): Promise<PaginatedResult<Source>>;

  abstract updateMetadata(
    sourceId: SourceId,
    metadata: {
      lastFetchedAt?: Date;
      cursor?: string | null;
      lastError?: string | null;
      status?: SourceStatus;
      fetchMetadata?: Record<string, unknown>;
    },
  ): Promise<void>;
}
