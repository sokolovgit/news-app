import { loadRelation } from '@/commons/database';

import { RawPost, RawPostLoadOptions } from '@/posts/domain/entities';
import { RawPostInsert, RawPostSelect } from '@/posts/domain/schemas';

import { SourceId, SourceSelect } from '@/sources/domain/schemas';
import { DrizzleSourcesEntityMapper } from '@/sources/service/sources-storage/mappers';

type RawPostWithRelations = Omit<RawPostSelect, 'source'> & {
  source: SourceId | SourceSelect | null;
};

export class DrizzleRawPostsEntityMapper {
  static toEntity(
    data: RawPostWithRelations,
    loadOptions: RawPostLoadOptions = {},
  ): RawPost {
    let sourceId: SourceId | undefined;

    if (typeof data.source === 'string') sourceId = data.source;
    else if (data.source !== null) sourceId = data.source.id;

    if (!sourceId) {
      throw new Error('Source ID is required');
    }

    const sourceEntity =
      typeof data.source === 'object' && data.source !== null
        ? data.source
        : undefined;

    return new RawPost(
      {
        id: data.id,
        source: sourceId,
        externalId: data.externalId,
        title: data.title ?? undefined,
        content: data.content,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      {
        source: loadRelation(loadOptions.withSource, sourceEntity, (source) =>
          DrizzleSourcesEntityMapper.toEntity(source),
        ),
      },
    );
  }

  static toSchema(entity: RawPost): RawPostInsert {
    return {
      id: entity.getId(),
      source: entity.getSourceId(),
      externalId: entity.getExternalId(),
      title: entity.getTitle(),
      content: entity.getContent(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
