import { timestamp } from 'drizzle-orm/pg-core';

export const timestamps = {
  createdAt: timestamp({
    mode: 'date',
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp({
    mode: 'date',
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};
