import { UserId } from '@/users/domain/schemas';
import { ArticleId } from '@/articles/domain/schemas';
import { EditorJsContent } from '@/articles/domain/types';

export type UpdateArticleRequest = {
  articleId: ArticleId;
  userId: UserId;
  title?: string;
  description?: string;
  content?: EditorJsContent;
  coverImageUrl?: string;
  sourceRawPostIds?: string[];
};
