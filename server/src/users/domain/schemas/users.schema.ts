import { pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';

import { Uuid } from '@/commons/utils';
import { timestamps, primaryUuid } from '@/commons/database';
import { relations } from 'drizzle-orm';
import { authPasswords } from '@/auth/domain/schemas';
import { UserRole } from '@/users/domain/enums';

export type UserId = Uuid<'users'>;

export const pgUserRoles = pgEnum(
  'user_roles',
  Object.values(UserRole) as [string, ...string[]],
);

export const users = pgTable('users', {
  id: primaryUuid<UserId>(),

  email: varchar('email').notNull().unique(),

  roles: pgUserRoles('roles')
    .array()
    .notNull()
    .default([UserRole.USER] as const),

  ...timestamps,
});

export const userRelations = relations(users, ({ one }) => ({
  authPassword: one(authPasswords, {
    fields: [users.id],
    references: [authPasswords.userId],
  }),
}));

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];
export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
