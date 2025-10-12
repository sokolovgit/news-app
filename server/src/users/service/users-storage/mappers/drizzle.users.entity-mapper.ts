import { ToEntityMapper } from '@/commons/database';
import { User } from '@/users/domain/entities';
import { UserRole } from '@/users/domain/enums/user-role.enum';
import { UserSelect } from '@/users/domain/schemas';

export class UserEntityMapper implements ToEntityMapper<UserSelect, User> {
  toEntity(data: UserSelect): User {
    return new User({
      id: data.id,
      email: data.email,
      roles: data.roles as UserRole[],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
