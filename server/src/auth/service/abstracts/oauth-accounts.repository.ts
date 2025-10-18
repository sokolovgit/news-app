import { UserId } from '@/users/domain/schemas';
import { OAuthAccount } from '@/auth/domain/entities';
import { OAuthProvider } from '@/auth/domain/enums';

export abstract class OAuthAccountsRepository {
  abstract save(oauthAccount: OAuthAccount): Promise<OAuthAccount | null>;

  abstract findOAuthAccountByProviderAndIdWithUser(
    provider: OAuthProvider,
    providerId: string,
  ): Promise<OAuthAccount | null>;

  abstract oauthAccountExistsForUser(userId: UserId): Promise<boolean>;
}
