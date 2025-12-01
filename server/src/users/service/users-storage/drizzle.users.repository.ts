import { Inject, Injectable } from '@nestjs/common';

import { eq, ilike, and, asc, desc, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { User, UserLoadOptions } from '@/users/domain/entities';
import { UserId, users } from '@/users/domain/schemas';
import { UsersRepository, UsersFilterParams } from '../abstracts';
import {
  PaginatedResult,
  PaginationParams,
  createPaginatedResult,
  SortOrder,
} from '@/commons/types';

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

  async getAllUsersPaginated(
    params: PaginationParams,
    filters?: UsersFilterParams,
    loadOptions: UserLoadOptions = {},
  ): Promise<PaginatedResult<User>> {
    const conditions = [];

    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      conditions.push(ilike(users.email, searchPattern));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause;
    if (filters?.sortField) {
      const sortField =
        filters.sortField === 'email' ? users.email : users.createdAt;
      orderByClause = [
        filters.sortOrder === 'asc' ? asc(sortField) : desc(sortField),
      ];
    } else {
      orderByClause = [desc(users.createdAt)];
    }

    const usersData = await this.db.query.users.findMany({
      where: whereClause,
      orderBy: orderByClause,
      with: this.buildRelations(loadOptions),
      limit: params.limit,
      offset: params.offset,
      extras: {
        total: sql<number>`count(*) over()`.as('total'),
      },
    });

    const total = usersData[0]?.total ?? 0;

    const userEntities = usersData.map((user) =>
      DrizzleUserEntityMapper.toEntity(user, loadOptions),
    );

    return createPaginatedResult(userEntities, total, params);
  }

  private buildRelations(relations: UserLoadOptions) {
    return {
      ...(relations.withEmailVerification && { emailVerification: true }),
      ...(relations.withOAuthAccounts && { oauthAccounts: true }),
      ...(relations.withRefreshToken && { refreshToken: true }),
    } as Record<string, boolean | undefined>;
  }
}
