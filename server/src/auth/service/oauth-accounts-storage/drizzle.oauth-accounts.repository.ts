import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_CONNECTION, drizzle } from '@/database';
import { DrizzleOAuthAccountEntityMapper } from './mappers/drizzle.oauth-account.entity-mapper';
import { OAuthAccountsRepository } from '../abstracts/oauth-accounts.repository';
import { OAuthAccount, OAuthAccountLoadOptions } from '@/auth/domain/entities';
import { OAuthProvider } from '@/auth/domain/enums';
import { oauthAccounts } from '@/auth/domain/schemas';
import { UserId, users, UserSelect } from '@/users/domain/schemas';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class DrizzleOAuthAccountsRepository extends OAuthAccountsRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private db: NodePgDatabase<typeof drizzle>,
  ) {
    super();
  }

  async save(oauthAccount: OAuthAccount): Promise<OAuthAccount | null> {
    return this.db.transaction(async (tx) => {
      const user: UserSelect | undefined = await tx.query.users.findFirst({
        where: eq(users.id, oauthAccount.getUserId()),
      });

      if (!user) {
        throw new Error('Cannot save OAuthAccount: User does not exist');
      }

      const oauthAccountData =
        DrizzleOAuthAccountEntityMapper.toSchema(oauthAccount);

      const [savedOAuthAccount] = await tx
        .insert(oauthAccounts)
        .values(oauthAccountData)
        .onConflictDoUpdate({
          target: oauthAccounts.id,
          set: oauthAccountData,
        })
        .returning();

      return savedOAuthAccount
        ? DrizzleOAuthAccountEntityMapper.toEntity({
            ...savedOAuthAccount,
            user: user,
          })
        : null;
    });
  }

  async existsForUser(userId: UserId): Promise<boolean> {
    return !!(await this.db.query.oauthAccounts.findFirst({
      where: eq(oauthAccounts.userId, userId),
      columns: {
        id: true,
      },
    }));
  }

  async findByProvider(
    provider: OAuthProvider,
    providerId: string,
    loadOptions: OAuthAccountLoadOptions = {},
  ): Promise<OAuthAccount | null> {
    const oauthAccount = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerId, providerId),
      ),
      with: this.buildWithRelations(loadOptions),
    });

    return oauthAccount
      ? DrizzleOAuthAccountEntityMapper.toEntity(oauthAccount, loadOptions)
      : null;
  }

  private buildWithRelations(options: OAuthAccountLoadOptions) {
    return {
      ...(options.withUser && { user: true }),
    } as Record<string, boolean | undefined>;
  }
}
