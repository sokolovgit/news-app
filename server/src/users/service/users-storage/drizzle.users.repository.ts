import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { UsersRepository } from '../abstracts';
import { User } from '@/users/domain/entities';
import { UserId, UserSelect } from '@/users/domain/schemas';

import { DRIZZLE_CONNECTION, drizzleSchemas } from '@/database';
import { UserEntityMapper } from './mappers';

@Injectable()
export class DrizzleUsersRepository extends UsersRepository {
  private userEntityMapper: UserEntityMapper;

  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private db: NodePgDatabase<typeof drizzleSchemas>,
  ) {
    super();
    this.userEntityMapper = new UserEntityMapper();
  }

  async getUserById(id: UserId): Promise<User | null> {
    const user: UserSelect | undefined = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });

    return user ? this.userEntityMapper.toEntity(user) : null;
  }
}
