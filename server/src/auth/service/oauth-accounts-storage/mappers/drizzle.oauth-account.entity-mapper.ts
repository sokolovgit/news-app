import { ToEntityMapper, ToSchemaMapper } from '@/commons/database';

import { OAuthAccount } from '@/auth/domain/entities';
import { OAuthProvider } from '@/auth/domain/enums';
import { OAuthAccountInsert, OAuthAccountSelect } from '@/auth/domain/schemas';
import { UserSelect } from '@/users/domain/schemas';
import { DrizzleUserEntityMapper } from '@/users/service/users-storage/mappers';

export class DrizzleOAuthAccountEntityMapper
  implements
    ToEntityMapper<OAuthAccountSelect, OAuthAccount>,
    ToSchemaMapper<OAuthAccount, OAuthAccountInsert>
{
  private userMapper: DrizzleUserEntityMapper;

  constructor() {
    this.userMapper = new DrizzleUserEntityMapper();
  }

  toEntity(data: OAuthAccountSelect & { user: UserSelect }): OAuthAccount {
    const user = this.userMapper.toEntity(data.user);

    return new OAuthAccount(
      {
        id: data.id,
        userId: data.userId,
        provider: data.provider as OAuthProvider,
        providerId: data.providerId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      { user },
    );
  }

  toSchema(entity: OAuthAccount): OAuthAccountInsert {
    return {
      id: entity.getId(),
      userId: entity.getUserId(),
      provider: entity.getProvider(),
      providerId: entity.getProviderId(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
