import { User } from '@/users/domain/entities';
import { UserId } from '@/users/domain/schemas';

export abstract class UsersRepository {
  abstract getUserById(id: UserId): Promise<User | null>;
}
