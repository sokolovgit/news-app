import { UserId } from '@/users/domain/schemas';
import { EditorJsContent } from '@/articles/domain/types';

export type CreateArticleRequest = {
  userId: UserId;
  title: string;
  description?: string;
  content: EditorJsContent;
  coverImageUrl?: string;
  sourceRawPostIds?: string[];
};
