import { UserId } from '@/users/domain/schemas';
import { User, UserLoadOptions } from '@/users/domain/entities';
import { PaginatedResult, PaginationParams } from '@/commons/types';

export interface UsersFilterParams {
  search?: string;
  sortField?: 'createdAt' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export abstract class UsersRepository {
  abstract getUserById(
    id: UserId,
    relations?: UserLoadOptions,
  ): Promise<User | null>;

  abstract getUserByEmail(
    email: string,
    relations?: UserLoadOptions,
  ): Promise<User | null>;

  abstract save(user: User): Promise<User | null>;

  abstract getAllUsersPaginated(
    params: PaginationParams,
    filters?: UsersFilterParams,
    loadOptions?: UserLoadOptions,
  ): Promise<PaginatedResult<User>>;
}
