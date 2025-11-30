import { RawPostId } from '@/raw-posts/domain/schemas';
import { UserId } from '@/users/domain/schemas';

export type GetRawPostByIdRequest = {
  postId: RawPostId;
  userId: UserId;
};
