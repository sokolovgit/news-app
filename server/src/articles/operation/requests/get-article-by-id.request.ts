import { ArticleId } from '@/articles/domain/schemas';
import { UserId } from '@/users/domain/schemas';

export type GetArticleByIdRequest = {
  articleId: ArticleId;
  userId: UserId;
};
