import { UserId } from '@/users/domain/schemas';

export type AddSourceRequest = {
  url: string;
  userId: UserId;
};
