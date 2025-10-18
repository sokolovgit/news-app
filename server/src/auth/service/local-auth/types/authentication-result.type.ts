import { User } from '@/users/domain/entities';
import { TokenPair } from '../../tokens/types';

export type AuthenticationResult = {
  user: User;
  tokens: TokenPair;
};
