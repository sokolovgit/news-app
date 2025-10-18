import { Inject, Injectable } from '@nestjs/common';
import { RefreshTokensRepository } from '../abstracts/refresh-tokens.repository';
import { DRIZZLE_CONNECTION, drizzleSchemas } from '@/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleRefreshTokenEntityMapper } from './mappers';
import { RefreshToken } from '@/auth/domain/entities';
import { eq } from 'drizzle-orm';
import { users, UserSelect } from '@/users/domain/schemas';
import { RefreshTokenId, refreshTokens } from '@/auth/domain/schemas';

@Injectable()
export class DrizzleRefreshTokensRepository extends RefreshTokensRepository {
  private mapper: DrizzleRefreshTokenEntityMapper;

  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private db: NodePgDatabase<typeof drizzleSchemas>,
  ) {
    super();
    this.mapper = new DrizzleRefreshTokenEntityMapper();
  }

  async save(refreshToken: RefreshToken): Promise<RefreshToken | null> {
    return this.db.transaction(async (tx) => {
      const user: UserSelect | undefined = await tx.query.users.findFirst({
        where: eq(users.id, refreshToken.getUserId()),
      });

      if (!user) {
        throw new Error('Cannot save RefreshToken: User does not exist');
      }

      const refreshTokenData = this.mapper.toSchema(refreshToken);

      const [savedRefreshToken] = await tx
        .insert(refreshTokens)
        .values(refreshTokenData)
        .returning();

      return savedRefreshToken
        ? this.mapper.toEntity({
            ...savedRefreshToken,
            user: user,
          })
        : null;
    });
  }

  async findRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, token),
      with: { user: true },
    });

    return refreshToken ? this.mapper.toEntity(refreshToken) : null;
  }

  async deleteRefreshTokenById(id: RefreshTokenId): Promise<boolean> {
    const result = await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.id, id));

    return result.rowCount ? result.rowCount > 0 : false;
  }
}
