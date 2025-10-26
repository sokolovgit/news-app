import { Inject, Injectable } from '@nestjs/common';
import { RefreshTokensRepository } from '../abstracts/refresh-tokens.repository';
import { DRIZZLE_CONNECTION, drizzle } from '@/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleRefreshTokenEntityMapper } from './mappers';
import { RefreshToken, RefreshTokenLoadOptions } from '@/auth/domain/entities';
import { eq } from 'drizzle-orm';
import { UserId, users, UserSelect } from '@/users/domain/schemas';
import { RefreshTokenId, refreshTokens } from '@/auth/domain/schemas';

@Injectable()
export class DrizzleRefreshTokensRepository extends RefreshTokensRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private db: NodePgDatabase<typeof drizzle>,
  ) {
    super();
  }

  async save(refreshToken: RefreshToken): Promise<RefreshToken | null> {
    return this.db.transaction(async (tx) => {
      const user: UserSelect | undefined = await tx.query.users.findFirst({
        where: eq(users.id, refreshToken.getUserId()),
      });

      if (!user) {
        throw new Error('Cannot save RefreshToken: User does not exist');
      }

      const refreshTokenData =
        DrizzleRefreshTokenEntityMapper.toSchema(refreshToken);

      const [savedRefreshToken] = await tx
        .insert(refreshTokens)
        .values(refreshTokenData)
        .returning();

      return savedRefreshToken
        ? DrizzleRefreshTokenEntityMapper.toEntity({
            ...savedRefreshToken,
            user: user,
          })
        : null;
    });
  }

  async findRefreshTokenByHashedToken(
    token: string,
    loadOptions: RefreshTokenLoadOptions = {},
  ): Promise<RefreshToken | null> {
    const refreshToken = await this.db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, token),
      with: this.buildWithRelations(loadOptions),
    });

    return refreshToken
      ? DrizzleRefreshTokenEntityMapper.toEntity(refreshToken, loadOptions)
      : null;
  }

  async findRefreshTokenByUserId(
    userId: UserId,
    loadOptions: RefreshTokenLoadOptions = {},
  ): Promise<RefreshToken | null> {
    const refreshToken = await this.db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.userId, userId),
      with: this.buildWithRelations(loadOptions),
    });

    return refreshToken
      ? DrizzleRefreshTokenEntityMapper.toEntity(refreshToken, loadOptions)
      : null;
  }

  async deleteRefreshTokenById(id: RefreshTokenId): Promise<boolean> {
    const result = await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.id, id));

    return result.rowCount ? result.rowCount > 0 : false;
  }

  private buildWithRelations(options: RefreshTokenLoadOptions) {
    return {
      ...(options.withUser && { user: true }),
    } as Record<string, boolean | undefined>;
  }
}
