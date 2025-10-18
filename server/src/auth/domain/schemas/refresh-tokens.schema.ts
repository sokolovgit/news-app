import { relations } from 'drizzle-orm';
import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import {
  brandedUuid,
  primaryUuid,
  timestamps,
  timestampConfig,
} from '@/commons/database';
import { Uuid } from '@/commons/utils';
import { UserId, users } from '@/users/domain/schemas';

export type RefreshTokenId = Uuid<'refresh_tokens'>;

export const refreshTokens = pgTable('refresh_tokens', {
  id: primaryUuid<RefreshTokenId>(),
  userId: brandedUuid<UserId>('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  token: varchar('token').notNull(),
  expiresAt: timestamp('expires_at', timestampConfig).notNull(),

  ...timestamps,
});

export type RefreshTokenSelect = typeof refreshTokens.$inferSelect;
export type RefreshTokenInsert = typeof refreshTokens.$inferInsert;

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));
