import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import {
  brandedUuid,
  primaryUuid,
  timestamps,
  timestampConfig,
} from '@/commons/database';
import { Uuid } from '@/commons/utils';
import { UserId, users } from '@/users/domain/schemas';
import { OAuthProviders } from '../enums';

export type OAuthAccountId = Uuid<'oauth_accounts'>;

export const pgOAuthProviders = pgEnum(
  'oauth_providers',
  Object.values(OAuthProviders) as [string, ...string[]],
);

export const oauthAccounts = pgTable('oauth_accounts', {
  id: primaryUuid<OAuthAccountId>(),

  userId: brandedUuid<UserId>('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  provider: pgOAuthProviders('provider').notNull(),
  providerId: varchar('provider_id').notNull().unique(),
  accessToken: varchar('access_token'),
  refreshToken: varchar('refresh_token'),
  expiresAt: timestamp('expires_at', timestampConfig),

  ...timestamps,
});

export const oauthAccountRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, {
    fields: [oauthAccounts.userId],
    references: [users.id],
  }),
}));

export type OAuthAccountSelect = typeof oauthAccounts.$inferSelect;
export type OAuthAccountInsert = typeof oauthAccounts.$inferInsert;
