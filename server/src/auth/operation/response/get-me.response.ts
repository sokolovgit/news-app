import { User } from '@/users/domain/entities';

export type GetMeResponse = {
  user: User;
  emailVerified: boolean;
};
