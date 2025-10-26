import { RefreshToken, RefreshTokenLoadOptions } from '@/auth/domain/entities';
import { RefreshTokenInsert, RefreshTokenSelect } from '@/auth/domain/schemas';
import { loadRelation } from '@/commons/database';
import { UserSelect } from '@/users/domain/schemas';
import { DrizzleUserEntityMapper } from '@/users/service/users-storage/mappers';

export class DrizzleRefreshTokenEntityMapper {
  static toEntity(
    data: RefreshTokenSelect & { user?: UserSelect | null },
    loadOptions: RefreshTokenLoadOptions = {},
  ): RefreshToken {
    return new RefreshToken(
      {
        id: data.id,
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      {
        user: loadRelation(loadOptions.withUser, data.user, (user) =>
          DrizzleUserEntityMapper.toEntity(user),
        ),
      },
    );
  }

  static toSchema(entity: RefreshToken): RefreshTokenInsert {
    return {
      id: entity.getId(),
      userId: entity.getUserId(),
      token: entity.getToken(),
      expiresAt: entity.getExpiresAt(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
