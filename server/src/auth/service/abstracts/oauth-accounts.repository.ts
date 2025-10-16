import { OAuthAccount } from '@/auth/domain/entities';
import { OAuthProvider } from '@/auth/domain/enums';
import { UserId } from '@/users/domain/schemas';

export abstract class OAuthAccountsRepository {
  abstract findByProviderAndId(
    provider: OAuthProvider,
    providerId: string,
  ): Promise<OAuthAccount | null>;

  abstract oauthAccountExistsForUser(userId: UserId): Promise<boolean>;
}
