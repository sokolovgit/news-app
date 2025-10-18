import { RefreshToken } from '@/auth/domain/entities';
import { RefreshTokenId } from '@/auth/domain/schemas';

export abstract class RefreshTokensRepository {
  abstract save(refreshToken: RefreshToken): Promise<RefreshToken | null>;
  abstract findRefreshTokenByToken(token: string): Promise<RefreshToken | null>;
  abstract deleteRefreshTokenById(id: RefreshTokenId): Promise<boolean>;
}
