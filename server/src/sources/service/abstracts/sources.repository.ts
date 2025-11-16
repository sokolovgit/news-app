import { SourceId } from '@/sources/domain/schemas';
import { Source, SourceLoadOptions } from '@/sources/domain/entities';

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
}
