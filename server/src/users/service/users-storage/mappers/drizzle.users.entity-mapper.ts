import { ToEntityMapper, ToSchemaMapper } from '@/commons/database';

import { User } from '@/users/domain/entities';
import { UserRole } from '@/users/domain/enums';
import { UserInsert, UserSelect } from '@/users/domain/schemas';

export class DrizzleUserEntityMapper
  implements ToEntityMapper<UserSelect, User>, ToSchemaMapper<User, UserInsert>
{
  toEntity(data: UserSelect): User {
    return new User({
      id: data.id,
      email: data.email,
      password: data.password ?? undefined,
      roles: data.roles as UserRole[],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  toSchema(entity: User): UserInsert {
    return {
      id: entity.getId()!,
      email: entity.getEmail(),
      password: entity.getPassword() ?? null,
      roles: entity.getRoles(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
