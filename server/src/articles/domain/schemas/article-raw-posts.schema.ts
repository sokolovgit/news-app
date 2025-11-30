import { relations } from 'drizzle-orm';
import { pgTable, unique } from 'drizzle-orm/pg-core';

import { Uuid } from '@/commons/utils';
import { primaryUuid, brandedUuid, timestamps } from '@/commons/database';

import { RawPostId, rawPosts } from '@/raw-posts/domain/schemas';
import { ArticleId, articles } from './articles.schema';

export type ArticleRawPostId = Uuid<'article_raw_posts'>;

export const articleRawPosts = pgTable(
  'article_raw_posts',
  {
    id: primaryUuid<ArticleRawPostId>(),
    articleId: brandedUuid<ArticleId>('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    rawPostId: brandedUuid<RawPostId>('raw_post_id')
      .notNull()
      .references(() => rawPosts.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (t) => [unique('article_id_raw_post_id').on(t.articleId, t.rawPostId)],
);

export type ArticleRawPostSelect = typeof articleRawPosts.$inferSelect;
export type ArticleRawPostInsert = typeof articleRawPosts.$inferInsert;

export const articleRawPostRelations = relations(
  articleRawPosts,
  ({ one }) => ({
    article: one(articles, {
      fields: [articleRawPosts.articleId],
      references: [articles.id],
    }),
    rawPost: one(rawPosts, {
      fields: [articleRawPosts.rawPostId],
      references: [rawPosts.id],
    }),
  }),
);
