import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { Uuid } from '@/commons/utils';
import { brandedUuid, primaryUuid, timestamps } from '@/commons/database';

import { UserId, users } from '@/users/domain/schemas';

export type AuthPasswordId = Uuid<'auth_passwords'>;

export const authPasswords = pgTable('auth_passwords', {
  id: primaryUuid<AuthPasswordId>(),

  userId: brandedUuid<UserId>('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),

  passwordHash: varchar('password_hash').notNull(),

  ...timestamps,
});

export type AuthPasswordSelect = typeof authPasswords.$inferSelect;
export type AuthPasswordInsert = typeof authPasswords.$inferInsert;
