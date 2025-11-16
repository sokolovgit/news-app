import { relations } from 'drizzle-orm';
import { pgTable, unique } from 'drizzle-orm/pg-core';

import { Uuid } from '@/commons/utils';
import { brandedUuid, primaryUuid, timestamps } from '@/commons/database';

import { users, UserId } from '@/users/domain/schemas';
import { sources, SourceId } from './sources.schema';

export type UserSourceId = Uuid<'user_sources'>;

export const userSources = pgTable(
  'user_sources',
  {
    id: primaryUuid<UserSourceId>(),
    userId: brandedUuid<UserId>('user_id')
      .notNull()
      .references(() => users.id, {
        onDelete: 'cascade',
      }),
    sourceId: brandedUuid<SourceId>('source_id')
      .notNull()
      .references(() => sources.id, {
        onDelete: 'cascade',
      }),
    ...timestamps,
  },
  (userSources) => [
    unique('user_id_source_id').on(userSources.userId, userSources.sourceId),
  ],
);

export type UserSourceSelect = typeof userSources.$inferSelect;
export type UserSourceInsert = typeof userSources.$inferInsert;

export const userSourceRelations = relations(userSources, ({ one }) => ({
  user: one(users, {
    fields: [userSources.userId],
    references: [users.id],
  }),
  source: one(sources, {
    fields: [userSources.sourceId],
    references: [sources.id],
  }),
}));
