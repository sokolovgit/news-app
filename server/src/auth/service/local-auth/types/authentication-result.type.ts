import { User } from '@/users/domain/entities';
import { AuthTokens } from '../../tokens/types';

export type AuthenticationResult = {
  user: User;
  tokens: AuthTokens;
};
