import { UserId } from '@/users/domain/schemas';
import { RefreshToken, RefreshTokenLoadOptions } from '@/auth/domain/entities';
import { RefreshTokenId } from '@/auth/domain/schemas';

export abstract class RefreshTokensRepository {
  abstract save(refreshToken: RefreshToken): Promise<RefreshToken | null>;

  abstract findRefreshTokenByHashedToken(
    hashedToken: string,
    loadOptions?: RefreshTokenLoadOptions,
  ): Promise<RefreshToken | null>;

  abstract findRefreshTokenByUserId(
    userId: UserId,
    loadOptions?: RefreshTokenLoadOptions,
  ): Promise<RefreshToken | null>;

  abstract deleteRefreshTokenById(id: RefreshTokenId): Promise<boolean>;
}
