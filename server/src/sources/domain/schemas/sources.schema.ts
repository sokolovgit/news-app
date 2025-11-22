import {
  pgEnum,
  pgTable,
  timestamp,
  varchar,
  jsonb,
} from 'drizzle-orm/pg-core';

import {
  primaryUuid,
  brandedUuid,
  timestamps,
  timestampConfig,
} from '@/commons/database';
import { Uuid } from '@/commons/utils';
import { Collector, PublicSource, SourceStatus } from '../enums';

import { UserId, users } from '@/users/domain/schemas';
import { relations } from 'drizzle-orm';

export type SourceId = Uuid<'sources'>;

export const pgSources = pgEnum(
  'sources_enum',
  Object.values(PublicSource) as [string, ...string[]],
);

export const pgCollectors = pgEnum(
  'collectors_enum',
  Object.values(Collector) as [string, ...string[]],
);

export const pgSourceStatus = pgEnum(
  'source_status_enum',
  Object.values(SourceStatus) as [string, ...string[]],
);

export const sources = pgTable('sources', {
  id: primaryUuid<SourceId>(),

  addedBy: brandedUuid<UserId>('added_by').references(() => users.id, {
    onDelete: 'set null',
  }),

  source: pgSources('source').notNull(),
  collector: pgCollectors('collector').notNull(),

  name: varchar('name').notNull(),
  url: varchar('url').notNull(),

  lastFetchedAt: timestamp('last_fetched_at', timestampConfig),

  // Metadata fields
  cursor: varchar('cursor'),
  lastError: varchar('last_error'),
  status: pgSourceStatus('status').default(SourceStatus.ACTIVE),
  fetchMetadata: jsonb('fetch_metadata'),

  ...timestamps,
});

export const sourceRelations = relations(sources, ({ one }) => ({
  addedBy: one(users, {
    fields: [sources.addedBy],
    references: [users.id],
  }),
}));

export type SourceSelect = typeof sources.$inferSelect;
export type SourceInsert = typeof sources.$inferInsert;
