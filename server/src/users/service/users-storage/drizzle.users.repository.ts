import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { User } from '@/users/domain/entities';
import { UserId, users, UserSelect } from '@/users/domain/schemas';
import { UsersRepository } from '../abstracts';

import { DRIZZLE_CONNECTION, drizzle } from '@/database';
import { DrizzleUserEntityMapper } from './mappers';

@Injectable()
export class DrizzleUsersRepository extends UsersRepository {
  private mapper: DrizzleUserEntityMapper;

  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private db: NodePgDatabase<typeof drizzle>,
  ) {
    super();

    this.mapper = new DrizzleUserEntityMapper();
  }

  async getUserById(id: UserId): Promise<User | null> {
    const user: UserSelect | undefined = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });

    return user ? this.mapper.toEntity(user) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user: UserSelect | undefined = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    return user ? this.mapper.toEntity(user) : null;
  }

  async save(user: User): Promise<User | null> {
    const userData = this.mapper.toSchema(user);

    const [savedUser] = await this.db
      .insert(users)
      .values(userData)
      .returning();

    return savedUser ? this.mapper.toEntity(savedUser) : null;
  }
}
