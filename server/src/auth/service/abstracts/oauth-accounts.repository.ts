import { UserId } from '@/users/domain/schemas';
import { OAuthAccount, OAuthAccountLoadOptions } from '@/auth/domain/entities';
import { OAuthProvider } from '@/auth/domain/enums';

export abstract class OAuthAccountsRepository {
  abstract save(oauthAccount: OAuthAccount): Promise<OAuthAccount | null>;

  abstract findByProvider(
    provider: OAuthProvider,
    providerId: string,
    loadOptions?: OAuthAccountLoadOptions,
  ): Promise<OAuthAccount | null>;

  abstract existsForUser(userId: UserId): Promise<boolean>;
}
