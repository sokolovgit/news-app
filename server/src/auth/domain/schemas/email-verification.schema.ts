import { relations } from 'drizzle-orm';
import { pgTable } from 'drizzle-orm/pg-core';

import { UserId, users } from '@/users/domain/schemas';
import { brandedUuid, timestamps } from '@/commons/database';

export const emailVerifications = pgTable('email_verifications', {
  id: brandedUuid<UserId>('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  ...timestamps,
});

export type EmailVerificationSelect = typeof emailVerifications.$inferSelect;
export type EmailVerificationInsert = typeof emailVerifications.$inferInsert;

export const emailVerificationRelations = relations(
  emailVerifications,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerifications.id],
      references: [users.id],
    }),
  }),
);
