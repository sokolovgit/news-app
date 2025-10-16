import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { DRIZZLE_CONNECTION, drizzleSchemas } from '@/database';
import { OAuthAccountsRepository } from '../abstracts/oauth-accounts.repository';
import { UserId } from '@/users/domain/schemas';
import { DrizzleOAuthAccountEntityMapper } from './mappers';
import { OAuthAccount } from '@/auth/domain/entities';
import { OAuthProvider } from '@/auth/domain/enums';
import { oauthAccounts, OAuthAccountSelect } from '@/auth/domain/schemas';

@Injectable()
export class DrizzleOAuthAccountsRepository extends OAuthAccountsRepository {
  private mapper: DrizzleOAuthAccountEntityMapper;

  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private db: NodePgDatabase<typeof drizzleSchemas>,
  ) {
    super();

    this.mapper = new DrizzleOAuthAccountEntityMapper();
  }

  async oauthAccountExistsForUser(userId: UserId): Promise<boolean> {
    return !!(await this.db.query.oauthAccounts.findFirst({
      where: (oauthAccounts, { eq }) => eq(oauthAccounts.userId, userId),
    }));
  }

  async findByProviderAndId(
    provider: OAuthProvider,
    providerId: string,
  ): Promise<OAuthAccount | null> {
    const oauthAccount: OAuthAccountSelect | undefined =
      await this.db.query.oauthAccounts.findFirst({
        where: (oauthAccounts, { eq }) => eq(oauthAccounts.provider, provider),
      });

    return oauthAccount ? this.mapper.toEntity(oauthAccount) : null;
  }
}
