import { loadRelation } from '@/commons/database';

import { Collector, PublicSource } from '@/sources/domain/enums';
import { Source, SourceLoadOptions } from '@/sources/domain/entities';
import { SourceInsert, SourceSelect } from '@/sources/domain/schemas';

import { UserSelect } from '@/users/domain/schemas';
import { DrizzleUserEntityMapper } from '@/users/service/users-storage/mappers';

export class DrizzleSourcesEntityMapper {
  static toEntity(
    data: SourceSelect & {
      user?: UserSelect | null;
    },
    loadOptions: SourceLoadOptions = {},
  ): Source {
    return new Source(
      {
        id: data.id,
        addedBy: data.addedBy ?? undefined,
        source: data.source as PublicSource,
        collector: data.collector as Collector,
        name: data.name,
        url: data.url,
        lastFetchedAt: data.lastFetchedAt ?? undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      {
        addedBy: loadRelation(loadOptions.withAddedBy, data.user, (user) =>
          DrizzleUserEntityMapper.toEntity(user),
        ),
      },
    );
  }

  static toSchema(entity: Source): SourceInsert {
    return {
      id: entity.getId(),
      addedBy: entity.getUserAddedById(),
      source: entity.getSource(),
      collector: entity.getCollector(),
      name: entity.getName(),
      url: entity.getUrl(),
      lastFetchedAt: entity.getLastFetchedAt(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
