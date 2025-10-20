import { User } from '@/users/domain/entities';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../tokens/types';
import { UsersService } from '@/users/service/users-service';
import { TokensService } from '../tokens';
import { LoggerService } from '@/logger';
import {
  InvalidAccessTokenError,
  InvalidRefreshTokenError,
} from '@/auth/domain/errors';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly logger: LoggerService,
  ) {}

  async validateAndGetUserOrThrow(
    accessToken: string,
    refreshToken: string,
  ): Promise<User | null> {
    this.logger.debug('Validating access token and refresh token');

    try {
      this.logger.debug('Verifying access token');

      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(accessToken);

      this.logger.debug(`Access token verified for user ID: ${payload.sub}`);

      const user = await this.getUserFromPayload(payload);

      if (!user) {
        this.logger.debug(`User not found for ID: ${payload.sub}`);
        throw new InvalidAccessTokenError('Malformed access token');
      }

      this.logger.debug(
        `User found: ${user.getId()}, validating refresh token`,
      );

      await this.tokensService.validateRefreshTokenOrThrow(refreshToken);

      this.logger.debug(
        `Authentication validated successfully for user: ${user.getId()}`,
      );

      return user;
    } catch (error) {
      const errorName = (error as { name?: string })?.name;
      this.logger.debug(
        `Authentication validation failed: ${errorName || 'Unknown error'}`,
      );

      switch (errorName) {
        case 'TokenExpiredError':
          throw new InvalidAccessTokenError('Access token has expired');
        case 'JsonWebTokenError':
          throw new InvalidAccessTokenError('Invalid access token signature');
        case 'NotBeforeError':
          throw new InvalidAccessTokenError('Access token not yet valid');
        case 'InvalidRefreshTokenError':
          throw new InvalidRefreshTokenError('Invalid refresh token');
        default:
          throw new InvalidAccessTokenError('Invalid access token');
      }
    }
  }

  private async getUserFromPayload(payload: JwtPayload): Promise<User | null> {
    this.logger.debug(
      `Getting user from JWT payload for user ID: ${payload.sub}`,
    );
    return await this.usersService.getUserById(payload.sub);
  }
}
