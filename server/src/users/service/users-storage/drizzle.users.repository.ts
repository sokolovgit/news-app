import { Inject, Injectable } from '@nestjs/common';

import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { User, UserLoadOptions } from '@/users/domain/entities';
import { UserId, users } from '@/users/domain/schemas';
import { UsersRepository } from '../abstracts';

import { DRIZZLE_CONNECTION, drizzle } from '@/database';
import { DrizzleUserEntityMapper } from './mappers';

@Injectable()
export class DrizzleUsersRepository extends UsersRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private db: NodePgDatabase<typeof drizzle>,
  ) {
    super();
  }

  async getUserById(
    id: UserId,
    relations: UserLoadOptions = {},
  ): Promise<User | null> {
    const userData = await this.db.query.users.findFirst({
      where: eq(users.id, id),
      with: this.buildRelations(relations),
    });

    return userData
      ? DrizzleUserEntityMapper.toEntity(userData, relations)
      : null;
  }

  async getUserByEmail(
    email: string,
    relations: UserLoadOptions = {},
  ): Promise<User | null> {
    const userData = await this.db.query.users.findFirst({
      where: eq(users.email, email),
      with: this.buildRelations(relations),
    });

    return userData
      ? DrizzleUserEntityMapper.toEntity(userData, relations)
      : null;
  }

  async save(user: User): Promise<User | null> {
    const userData = DrizzleUserEntityMapper.toSchema(user);

    const [savedUser] = await this.db
      .insert(users)
      .values(userData)
      .returning();

    return savedUser ? DrizzleUserEntityMapper.toEntity(savedUser) : null;
  }

  private buildRelations(relations: UserLoadOptions) {
    return {
      ...(relations.withEmailVerification && { emailVerification: true }),
      ...(relations.withOAuthAccounts && { oauthAccounts: true }),
      ...(relations.withRefreshToken && { refreshToken: true }),
    } as Record<string, boolean | undefined>;
  }
}
