import { RefreshTokenId } from '@/auth/domain/schemas';
import { LoadState } from '@/commons/types';
import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';

type CreateRefreshTokenRelations = {
  user: LoadState<User>;
};

export type CreateRefreshTokenProps = {
  id?: RefreshTokenId;
  userId: UserId;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
} & {
  relations: CreateRefreshTokenRelations;
};
