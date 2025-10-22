import * as dayjs from 'dayjs';

import { Injectable } from '@nestjs/common';

import { uuid } from '@/commons/utils';
import { LoggerService } from '@/logger';
import {
  InvalidRefreshTokenError,
  TokenGenerationFailedError,
} from '@/auth/domain/errors';

import { JwtService } from '../jwt-service';
import { ConfigService } from '@/config';
import { HashingService } from '../hashing';

import { RefreshTokensRepository } from '../abstracts/refresh-tokens.repository';

import { CreateRefreshTokenProps, AuthTokens } from './types';

import { User } from '@/users/domain/entities';
import { RefreshToken } from '@/auth/domain/entities';
import { RefreshTokenId } from '@/auth/domain/schemas';
import { AuthenticationResult } from '../local-auth/types/authentication-result.type';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly hashingService: HashingService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Creates a new refresh token in the database
   */
  async createRefreshTokenOrThrow(
    props: CreateRefreshTokenProps,
  ): Promise<RefreshToken> {
    this.logger.debug(`Creating refresh token for user ID: ${props.userId}`);

    const newRefreshToken = new RefreshToken(
      {
        id: props.id ?? uuid<RefreshTokenId>(),
        userId: props.userId,
        token: props.token,
        expiresAt: props.expiresAt,
      },
      { user: props.relations.user },
    );

    const savedRefreshToken =
      await this.refreshTokensRepository.save(newRefreshToken);

    if (!savedRefreshToken) {
      this.logger.debug(
        `Failed to save refresh token for user ID: ${props.userId}`,
      );
      throw new TokenGenerationFailedError(
        props.userId,
        'Database save failed',
      );
    }

    this.logger.debug(
      `Refresh token created successfully for user ID: ${props.userId}`,
    );

    return savedRefreshToken;
  }

  /**
   * Deletes a refresh token by its ID
   */
  async deleteRefreshTokenByIdOrThrow(id: RefreshTokenId): Promise<void> {
    this.logger.debug(`Deleting refresh token with ID: ${id}`);

    const isDeleted =
      await this.refreshTokensRepository.deleteRefreshTokenById(id);

    if (!isDeleted) {
      this.logger.debug(`Failed to delete refresh token with ID: ${id}`);
      throw new TokenGenerationFailedError(
        id,
        'Failed to delete refresh token',
      );
    }

    this.logger.debug(`Refresh token deleted successfully with ID: ${id}`);
  }

  /**
   * Issues new access and refresh tokens for a user
   */
  async issueTokens(user: User): Promise<AuthTokens> {
    this.logger.debug(`Issuing tokens for user ID: ${user.getId()}`);

    this.logger.debug(`Signing access token for user ID: ${user.getId()}`);

    const accessToken = await this.jwtService.generateJwtTokenFromUser(user);

    this.logger.debug(
      `Checking for existing refresh token for user ID: ${user.getId()}`,
    );

    const foundRefreshToken =
      await this.refreshTokensRepository.findRefreshTokenByUserId(user.getId());

    if (foundRefreshToken) {
      this.logger.debug(
        `Found existing refresh token, deleting it for user ID: ${user.getId()}`,
      );
      await this.deleteRefreshTokenByIdOrThrow(foundRefreshToken.getId());
    }

    const { plainToken } = await this.generateRefreshToken(user);

    this.logger.debug(
      `Tokens issued successfully for user ID: ${user.getId()}`,
    );

    return {
      accessToken,
      plainRefreshToken: plainToken,
    };
  }

  /**
   * Validates a refresh token and returns it if valid
   */
  async validateRefreshTokenOrThrow(token: string): Promise<RefreshToken> {
    this.logger.debug('Validating refresh token');

    const hashedToken = this.hashingService.hashToken(token);

    this.logger.debug('Looking up refresh token in database');

    const refreshToken =
      await this.refreshTokensRepository.findRefreshTokenByToken(hashedToken);

    if (!refreshToken) {
      this.logger.debug('Refresh token not found in database');
      throw new InvalidRefreshTokenError('Token not found');
    }

    this.logger.debug(`Found refresh token with ID: ${refreshToken.getId()}`);

    const isExpired = dayjs().isAfter(dayjs(refreshToken.getExpiresAt()));

    if (isExpired) {
      this.logger.debug(
        `Refresh token expired for token ID: ${refreshToken.getId()}`,
      );
      throw new InvalidRefreshTokenError('Token expired');
    }

    const user = refreshToken.getUser();

    if (!user) {
      this.logger.debug(
        `User not found for refresh token ID: ${refreshToken.getId()}`,
      );
      throw new InvalidRefreshTokenError('User not found');
    }

    this.logger.debug(
      `Refresh token validated successfully for user ID: ${user.getId()}`,
    );

    return refreshToken;
  }

  /**
   * Refreshes tokens using a valid refresh token
   */
  async refreshToken(token: string): Promise<AuthenticationResult> {
    this.logger.debug('Starting token refresh process');

    const refreshToken = await this.validateRefreshTokenOrThrow(token);

    this.logger.debug(
      `Deleting old refresh token for user ID: ${refreshToken.getUser().getId()}`,
    );

    await this.deleteRefreshTokenByIdOrThrow(refreshToken.getId());

    const user = refreshToken.getUser();

    this.logger.debug(`Issuing new tokens for user ID: ${user.getId()}`);

    const tokens = await this.issueTokens(user);

    this.logger.debug(`Token refresh completed for user ID: ${user.getId()}`);

    return { user, tokens };
  }

  /**
   * Logs out a user by invalidating their refresh token
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    this.logger.debug('Starting logout process');

    const refreshTokenEntity =
      await this.validateRefreshTokenOrThrow(refreshToken);

    this.logger.debug(
      `Deleting refresh token for user ID: ${refreshTokenEntity.getUser().getId()}`,
    );

    await this.deleteRefreshTokenByIdOrThrow(refreshTokenEntity.getId());

    this.logger.debug(
      `Logout completed for user ID: ${refreshTokenEntity.getUser().getId()}`,
    );
  }

  private async generateRefreshToken(
    user: User,
  ): Promise<{ refreshToken: RefreshToken; plainToken: string }> {
    this.logger.debug(
      `Generating new refresh token for user ID: ${user.getId()}`,
    );

    const token = uuid();
    const hashedToken = this.hashingService.hashToken(token);

    const expiresAt = dayjs()
      .add(this.configService.auth.refreshTokenExpiresInMs, 'ms')
      .toDate();

    this.logger.debug(
      `Refresh token will expire at: ${expiresAt.toISOString()}`,
    );

    const refreshToken = await this.createRefreshTokenOrThrow({
      userId: user.getId(),
      token: hashedToken,
      expiresAt,
      relations: { user },
    });

    this.logger.debug(
      `Refresh token generated successfully for user ID: ${user.getId()}`,
    );

    return { refreshToken, plainToken: token };
  }
}
