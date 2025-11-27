import { loadRelation } from '@/commons/database';

import { RawPost, RawPostLoadOptions } from '@/posts/domain/entities';
import { RawPostInsert, RawPostSelect } from '@/posts/domain/schemas';

import { SourceId, SourceSelect } from '@/sources/domain/schemas';
import { DrizzleSourcesEntityMapper } from '@/sources/service/sources-storage/mappers';

export class DrizzleRawPostsEntityMapper {
  static toEntity(
    data: RawPostSelect & { source?: SourceSelect | null },
    loadOptions: RawPostLoadOptions = {},
  ): RawPost {
    const sourceEntity = data.source;

    return new RawPost(
      {
        id: data.id,
        sourceId: data.sourceId as SourceId,
        externalId: data.externalId,
        title: data.title ?? undefined,
        content: data.content,
        isBanned: data.isBanned ?? false,
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
      sourceId: entity.getSourceId(),
      externalId: entity.getExternalId(),
      title: entity.getTitle(),
      content: entity.getContent(),
      isBanned: entity.getIsBanned(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
