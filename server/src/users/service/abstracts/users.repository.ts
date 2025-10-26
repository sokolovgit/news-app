import { UserId } from '@/users/domain/schemas';
import { User, UserLoadOptions } from '@/users/domain/entities';

export abstract class UsersRepository {
  abstract getUserById(
    id: UserId,
    options?: UserLoadOptions,
  ): Promise<User | null>;

  abstract getUserByEmail(
    email: string,
    options?: UserLoadOptions,
  ): Promise<User | null>;

  abstract save(user: User): Promise<User | null>;
}
