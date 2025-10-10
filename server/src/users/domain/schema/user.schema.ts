import { pgTable, varchar } from 'drizzle-orm/pg-core';

import { Uuid } from '@/commons/utils';
import { timestamps, primaryUuid } from '@/commons/database';

export type UserId = Uuid<'users'>;

export const users = pgTable('users', {
  id: primaryUuid<UserId>(),

  email: varchar('email').unique(),

  ...timestamps,
});

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
