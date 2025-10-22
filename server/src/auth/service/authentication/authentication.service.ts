import { User } from '@/users/domain/entities';
import { Injectable } from '@nestjs/common';

import { JwtService } from '../jwt-service';
import { TokensService } from '../tokens';
import { LoggerService } from '@/logger';
import { EmailVerificationsService } from '../email-verifications';

import {
  EmailNotVerifiedError,
  InvalidAccessTokenError,
  InvalidRefreshTokenError,
} from '@/auth/domain/errors';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly logger: LoggerService,
    private readonly jwtService: JwtService,
    private readonly tokensService: TokensService,
    private readonly emailVerificationsService: EmailVerificationsService,
  ) {}

  async validateAndGetUserOrThrow(
    accessToken: string,
    refreshToken: string,
  ): Promise<User> {
    this.logger.debug('Validating access token and refresh token');

    try {
      this.logger.debug('Verifying access token');

      const user = await this.getUserFromAccessTokenOrThrow(accessToken);

      this.logger.debug(
        `User found: ${user.getId()}, validating refresh token`,
      );

      await this.tokensService.validateRefreshTokenOrThrow(refreshToken);

      this.logger.debug(
        `Authentication validated successfully for user: ${user.getId()}`,
      );

      const isEmailVerified =
        await this.emailVerificationsService.isEmailVerified(user.getId());

      if (!isEmailVerified) {
        this.logger.debug(
          `Email not verified for user: ${user.getId()} and email: ${user.getEmail()}`,
        );
        throw new EmailNotVerifiedError('Email not verified');
      }
      this.logger.debug(
        `Email verified for user: ${user.getId()} and email: ${user.getEmail()}`,
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
        case 'EmailNotVerifiedError':
          throw new EmailNotVerifiedError('Email not verified');
        default:
          throw new InvalidAccessTokenError('Invalid access token');
      }
    }
  }

  private async getUserFromAccessTokenOrThrow(
    accessToken: string,
  ): Promise<User> {
    const payload = await this.jwtService.verifyJwtTokenOrThrow(accessToken);

    return await this.jwtService.getUserFromJwtPayloadOrThrow(payload);
  }
}
