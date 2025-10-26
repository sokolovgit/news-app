import { OAuthProvider } from '@/auth/domain/enums';
import { OAuthAccountId } from '@/auth/domain/schemas';
import { LoadState } from '@/commons/types';
import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';

type CreateOAuthAccountRelations = {
  user: LoadState<User>;
};

export type CreateOAuthAccountProps = {
  id?: OAuthAccountId;
  userId: UserId;
  provider: OAuthProvider;
  providerId: string;
  createdAt?: Date;
  updatedAt?: Date;

  relations: CreateOAuthAccountRelations;
};
