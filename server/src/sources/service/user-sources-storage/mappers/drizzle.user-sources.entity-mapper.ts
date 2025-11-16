import { loadRelation } from '@/commons/database';

import { UserSource, UserSourceLoadOptions } from '@/sources/domain/entities';
import {
  SourceSelect,
  UserSourceInsert,
  UserSourceSelect,
} from '@/sources/domain/schemas';
import { UserSelect } from '@/users/domain/schemas';
import { DrizzleSourcesEntityMapper } from '@/sources/service/sources-storage/mappers';
import { DrizzleUserEntityMapper } from '@/users/service/users-storage/mappers';

type UserSourceWithRelations = UserSourceSelect & {
  user?: UserSelect | null;
  source?: SourceSelect | null;
};

export class DrizzleUserSourcesEntityMapper {
  static toEntity(
    data: UserSourceWithRelations,
    loadOptions: UserSourceLoadOptions = {},
  ): UserSource {
    return new UserSource(
      {
        id: data.id,
        userId: data.userId,
        sourceId: data.sourceId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      {
        user: loadRelation(loadOptions.withUser, data.user, (user) =>
          DrizzleUserEntityMapper.toEntity(user),
        ),
        source: loadRelation(loadOptions.withSource, data.source, (source) =>
          DrizzleSourcesEntityMapper.toEntity(source),
        ),
      },
    );
  }

  static toSchema(entity: UserSource): UserSourceInsert {
    return {
      id: entity.getId(),
      userId: entity.getUserId(),
      sourceId: entity.getSourceId(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
