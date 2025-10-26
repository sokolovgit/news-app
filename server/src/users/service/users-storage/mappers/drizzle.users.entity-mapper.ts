import { loadRelation } from '@/commons/database';

import { User, UserLoadOptions } from '@/users/domain/entities';
import { UserRole } from '@/users/domain/enums';
import { UserInsert, UserSelect } from '@/users/domain/schemas';

import {
  OAuthAccountSelect,
  RefreshTokenSelect,
  EmailVerificationSelect,
} from '@/auth/domain/schemas';

import { DrizzleOAuthAccountEntityMapper } from '@/auth/service/oauth-accounts-storage/mappers';
import { DrizzleRefreshTokenEntityMapper } from '@/auth/service/refresh-tokens-storage/mappers';
import { DrizzleEmailVerificationEntityMapper } from '@/auth/service/email-verifications-storage/mappers';

export class DrizzleUserEntityMapper {
  static toEntity(
    data: UserSelect & {
      emailVerification?: EmailVerificationSelect | null;
      oauthAccounts?: OAuthAccountSelect[];
      refreshToken?: RefreshTokenSelect | null;
    },
    loadOptions: UserLoadOptions = {},
  ): User {
    return new User(
      {
        id: data.id,
        email: data.email,
        password: data.password ?? undefined,
        roles: data.roles as UserRole[],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      {
        emailVerification: loadRelation(
          loadOptions.withEmailVerification,
          data.emailVerification,
          (emailVerification) =>
            DrizzleEmailVerificationEntityMapper.toEntity({
              ...emailVerification,
              user: data,
            }),
        ),
        oauthAccounts: loadRelation(
          loadOptions.withOAuthAccounts,
          data.oauthAccounts,
          (oauthAccounts) =>
            oauthAccounts.map((oauthAccount) =>
              DrizzleOAuthAccountEntityMapper.toEntity({
                ...oauthAccount,
                user: data,
              }),
            ),
        ),
        refreshToken: loadRelation(
          loadOptions.withRefreshToken,
          data.refreshToken,
          (refreshToken) =>
            DrizzleRefreshTokenEntityMapper.toEntity({
              ...refreshToken,
              user: data,
            }),
        ),
      },
    );
  }

  static toSchema(entity: User): UserInsert {
    return {
      id: entity.getId(),
      email: entity.getEmail(),
      password: entity.getHashedPassword() ?? null,
      roles: entity.getRoles(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
