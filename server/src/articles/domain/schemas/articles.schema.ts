import { relations } from 'drizzle-orm';
import {
  jsonb,
  pgTable,
  pgEnum,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

import { Uuid } from '@/commons/utils';
import { UserId, users } from '@/users/domain/schemas';
import { primaryUuid, brandedUuid, timestamps } from '@/commons/database';

import { EditorJsContent } from '../types';
import { ArticleStatus } from '../enums';
import { articleRawPosts } from './article-raw-posts.schema';

export type ArticleId = Uuid<'articles'>;

export const pgArticleStatus = pgEnum(
  'article_status',
  Object.values(ArticleStatus) as [string, ...string[]],
);

export const articles = pgTable('articles', {
  id: primaryUuid<ArticleId>(),
  authorId: brandedUuid<UserId>('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 600 }).unique(),
  description: varchar('description', { length: 1000 }),
  content: jsonb('content').$type<EditorJsContent>().notNull(),
  coverImageUrl: varchar('cover_image_url'),

  status: pgArticleStatus('status').default(ArticleStatus.DRAFT).notNull(),

  publishedAt: timestamp('published_at'),
  viewCount: integer('view_count').default(0).notNull(),

  ...timestamps,
});

export type ArticleSelect = typeof articles.$inferSelect;
export type ArticleInsert = typeof articles.$inferInsert;

export const articleRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  sourceRawPosts: many(articleRawPosts),
}));
