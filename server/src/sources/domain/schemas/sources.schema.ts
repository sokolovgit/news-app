import { pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import {
  primaryUuid,
  brandedUuid,
  timestamps,
  timestampConfig,
} from '@/commons/database';
import { Uuid } from '@/commons/utils';
import { SourceCollectors, Sources } from '../enums';

import { UserId, users } from '@/users/domain/schemas';
import { relations } from 'drizzle-orm';

export type SourceId = Uuid<'sources'>;

export const pgSources = pgEnum(
  'source_type',
  Object.values(Sources) as [string, ...string[]],
);

export const pgCollectors = pgEnum(
  'collector_type',
  Object.values(SourceCollectors) as [string, ...string[]],
);

export const sources = pgTable('sources', {
  id: primaryUuid<SourceId>(),

  addedBy: brandedUuid<UserId>('added_by').references(() => users.id, {
    onDelete: 'set null',
  }),

  sourceType: pgSources('source').notNull(),
  collectorType: pgCollectors('collector').notNull(),

  name: varchar('name').notNull(),
  url: varchar('url').notNull(),

  lastFetchedAt: timestamp('last_fetched_at', timestampConfig),

  ...timestamps,
});

export const sourceRelations = relations(sources, ({ one }) => ({
  addedBy: one(users, {
    fields: [sources.addedBy],
    references: [users.id],
  }),
}));

export type SourceType = (typeof Sources)[keyof typeof Sources];
export type CollectorType =
  (typeof SourceCollectors)[keyof typeof SourceCollectors];

export type SourceSelect = typeof sources.$inferSelect;
export type SourceInsert = typeof sources.$inferInsert;
