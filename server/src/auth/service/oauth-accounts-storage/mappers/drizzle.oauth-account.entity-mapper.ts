import { OAuthAccount, OAuthAccountLoadOptions } from '@/auth/domain/entities';
import { OAuthProvider } from '@/auth/domain/enums';
import { OAuthAccountInsert, OAuthAccountSelect } from '@/auth/domain/schemas';
import { loadRelation } from '@/commons/database';
import { UserSelect } from '@/users/domain/schemas';
import { DrizzleUserEntityMapper } from '@/users/service/users-storage/mappers';

export class DrizzleOAuthAccountEntityMapper {
  static toEntity(
    data: OAuthAccountSelect & { user?: UserSelect | null },
    loadOptions: OAuthAccountLoadOptions = {},
  ): OAuthAccount {
    return new OAuthAccount(
      {
        id: data.id,
        userId: data.userId,
        provider: data.provider as OAuthProvider,
        providerId: data.providerId,
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

  static toSchema(entity: OAuthAccount): OAuthAccountInsert {
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
