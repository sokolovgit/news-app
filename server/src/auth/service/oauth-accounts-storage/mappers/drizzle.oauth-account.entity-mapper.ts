import { ToEntityMapper, ToSchemaMapper } from '@/commons/database';

import { OAuthAccount } from '@/auth/domain/entities';
import { OAuthProvider } from '@/auth/domain/enums';
import { OAuthAccountInsert, OAuthAccountSelect } from '@/auth/domain/schemas';

export class DrizzleOAuthAccountEntityMapper
  implements
    ToEntityMapper<OAuthAccountSelect, OAuthAccount>,
    ToSchemaMapper<OAuthAccount, OAuthAccountInsert>
{
  toEntity(data: OAuthAccountSelect): OAuthAccount {
    return new OAuthAccount({
      id: data.id,
      userId: data.userId,
      provider: data.provider as OAuthProvider,
      providerId: data.providerId,
      accessToken: data.accessToken ?? undefined,
      refreshToken: data.refreshToken ?? undefined,
      expiresAt: data.expiresAt ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  toSchema(entity: OAuthAccount): OAuthAccountInsert {
    return {
      id: entity.getId(),
      userId: entity.getUserId(),
      provider: entity.getProvider(),
      providerId: entity.getProviderId(),
      accessToken: entity.getAccessToken(),
      refreshToken: entity.getRefreshToken(),
      expiresAt: entity.getExpiresAt(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
