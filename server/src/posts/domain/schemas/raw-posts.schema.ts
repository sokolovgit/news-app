import { brandedUuid, primaryUuid, timestamps } from '@/commons/database';
import { Uuid } from '@/commons/utils';
import { SourceId, sources } from '@/sources/domain/schemas';
import { jsonb, pgTable, varchar } from 'drizzle-orm/pg-core';
import { Content } from '../types';
import { relations } from 'drizzle-orm';

export type RawPostId = Uuid<'raw_posts'>;

export const rawPosts = pgTable('raw_posts', {
  id: primaryUuid<RawPostId>(),
  source: brandedUuid<SourceId>('source').references(() => sources.id, {
    onDelete: 'cascade',
  }),
  externalId: varchar('external_id').notNull(),

  title: varchar('title'),
  content: jsonb('content').$type<Content>().notNull(),

  ...timestamps,
});

export type RawPostSelect = typeof rawPosts.$inferSelect;
export type RawPostInsert = typeof rawPosts.$inferInsert;

export const rawPostRelations = relations(rawPosts, ({ one }) => ({
  source: one(sources, {
    fields: [rawPosts.source],
    references: [sources.id],
  }),
}));
