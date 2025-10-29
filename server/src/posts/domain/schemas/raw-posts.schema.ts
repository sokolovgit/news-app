import { relations } from 'drizzle-orm';
import { jsonb, pgTable, unique, varchar } from 'drizzle-orm/pg-core';

import { Uuid } from '@/commons/utils';
import { SourceId, sources } from '@/sources/domain/schemas';
import { brandedUuid, primaryUuid, timestamps } from '@/commons/database';

import { Content } from '../types';

export type RawPostId = Uuid<'raw_posts'>;

export const rawPosts = pgTable(
  'raw_posts',
  {
    id: primaryUuid<RawPostId>(),
    sourceId: brandedUuid<SourceId>('source_id').references(() => sources.id, {
      onDelete: 'cascade',
    }),
    externalId: varchar('external_id').notNull(),

    title: varchar('title'),
    content: jsonb('content').$type<Content>().notNull(),

    ...timestamps,
  },
  (rawPosts) => [
    unique('source_id_external_id').on(rawPosts.sourceId, rawPosts.externalId),
  ],
);

export type RawPostSelect = typeof rawPosts.$inferSelect;
export type RawPostInsert = typeof rawPosts.$inferInsert;

export const rawPostRelations = relations(rawPosts, ({ one }) => ({
  source: one(sources, {
    fields: [rawPosts.sourceId],
    references: [sources.id],
  }),
}));
