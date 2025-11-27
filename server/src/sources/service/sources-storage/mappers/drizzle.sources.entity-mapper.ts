import { loadRelation } from '@/commons/database';

import { PublicSource, SourceStatus } from '@/sources/domain/enums';
import {
  Source,
  SourceLoadOptions,
  SourceProperties,
} from '@/sources/domain/entities';
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
        name: data.name,
        url: data.url,
        lastFetchedAt: data.lastFetchedAt ?? undefined,
        cursor: data.cursor ?? undefined,
        lastError: data.lastError ?? undefined,
        status:
          (data.status as SourceProperties['status']) ?? SourceStatus.ACTIVE,
        fetchMetadata:
          (data.fetchMetadata as Record<string, unknown>) ?? undefined,
        isBanned: data.isBanned ?? false,
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
      name: entity.getName(),
      url: entity.getUrl(),
      lastFetchedAt: entity.getLastFetchedAt(),
      cursor: entity.getCursor(),
      lastError: entity.getLastError(),
      status: entity.getStatus(),
      fetchMetadata: entity.getFetchMetadata(),
      isBanned: entity.getIsBanned(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
