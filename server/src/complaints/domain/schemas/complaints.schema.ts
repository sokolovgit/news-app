import { pgEnum, pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import {
  primaryUuid,
  brandedUuid,
  timestamps,
  timestampConfig,
} from '@/commons/database';
import { Uuid } from '@/commons/utils';
import {
  ComplaintStatus,
  ComplaintReason,
  ComplaintTargetType,
} from '../enums';
import { UserId, users } from '@/users/domain/schemas';

export type ComplaintId = Uuid<'complaints'>;

export const pgComplaintStatus = pgEnum(
  'complaint_status_enum',
  Object.values(ComplaintStatus) as [string, ...string[]],
);

export const pgComplaintReason = pgEnum(
  'complaint_reason_enum',
  Object.values(ComplaintReason) as [string, ...string[]],
);

export const pgComplaintTargetType = pgEnum(
  'complaint_target_type_enum',
  Object.values(ComplaintTargetType) as [string, ...string[]],
);

export const complaints = pgTable('complaints', {
  id: primaryUuid<ComplaintId>(),

  targetType: pgComplaintTargetType('target_type').notNull(),
  targetId: varchar('target_id').notNull(), // Can be SourceId or RawPostId

  reason: pgComplaintReason('reason').notNull(),
  description: text('description'),

  status: pgComplaintStatus('status')
    .default(ComplaintStatus.PENDING)
    .notNull(),

  reportedBy: brandedUuid<UserId>('reported_by')
    .references(() => users.id, {
      onDelete: 'cascade',
    })
    .notNull(),

  resolvedBy: brandedUuid<UserId>('resolved_by').references(() => users.id, {
    onDelete: 'set null',
  }),

  resolvedAt: timestamp('resolved_at', timestampConfig),
  resolutionNote: text('resolution_note'),

  ...timestamps,
});

export const complaintRelations = relations(complaints, ({ one }) => ({
  reporter: one(users, {
    fields: [complaints.reportedBy],
    references: [users.id],
    relationName: 'complaint_reporter',
  }),
  resolver: one(users, {
    fields: [complaints.resolvedBy],
    references: [users.id],
    relationName: 'complaint_resolver',
  }),
}));

export type ComplaintSelect = typeof complaints.$inferSelect;
export type ComplaintInsert = typeof complaints.$inferInsert;
