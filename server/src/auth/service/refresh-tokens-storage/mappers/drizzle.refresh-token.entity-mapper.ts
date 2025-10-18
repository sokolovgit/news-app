import { RefreshToken } from '@/auth/domain/entities';
import { RefreshTokenInsert, RefreshTokenSelect } from '@/auth/domain/schemas';
import { ToEntityMapper, ToSchemaMapper } from '@/commons/database';
import { UserSelect } from '@/users/domain/schemas';
import { DrizzleUserEntityMapper } from '@/users/service/users-storage/mappers';

export class DrizzleRefreshTokenEntityMapper
  implements
    ToEntityMapper<RefreshTokenSelect, RefreshToken>,
    ToSchemaMapper<RefreshToken, RefreshTokenInsert>
{
  private userMapper: DrizzleUserEntityMapper;

  constructor() {
    this.userMapper = new DrizzleUserEntityMapper();
  }

  toEntity(data: RefreshTokenSelect & { user: UserSelect }): RefreshToken {
    const user = this.userMapper.toEntity(data.user);

    return new RefreshToken(
      {
        id: data.id,
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      { user },
    );
  }

  toSchema(entity: RefreshToken): RefreshTokenInsert {
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
