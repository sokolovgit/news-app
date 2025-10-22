import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

import { LoggerService } from '@/logger';
import { UsersService } from '@/users/service/users-service';

import { JwtPayload } from '../tokens/types';

import { User } from '@/users/domain/entities';
import { UserNotFoundError } from '@/users/domain/errors';

@Injectable()
export class JwtService {
  constructor(
    private readonly logger: LoggerService,
    private readonly jwtService: NestJwtService,
    private readonly usersService: UsersService,
  ) {}

  async verifyJwtTokenOrThrow(jwt: string): Promise<JwtPayload> {
    try {
      this.logger.debug(`Verifying JWT token: ${jwt}`);

      const payload = await this.jwtService.verifyAsync<JwtPayload>(jwt);

      this.logger.debug(
        `JWT token verified successfully for user ID: ${payload.sub}`,
      );

      return payload;
    } catch (error) {
      this.logger.error(`Error verifying JWT token: ${error}`);
      throw error;
    }
  }

  async getUserFromJwtPayloadOrThrow(payload: JwtPayload): Promise<User> {
    try {
      this.logger.debug(
        `Getting user from JWT payload for user ID: ${payload.sub}`,
      );

      const user = await this.usersService.getUserById(payload.sub);

      if (!user) {
        this.logger.debug(`User not found for ID: ${payload.sub}`);
        throw new UserNotFoundError(payload.sub, 'id');
      }

      return user;
    } catch (error) {
      this.logger.error(`Error getting user from JWT payload: ${error}`);
      throw error;
    }
  }

  async getUserFromJwtTokenOrThrow(jwt: string): Promise<User> {
    const payload = await this.verifyJwtTokenOrThrow(jwt);
    return await this.getUserFromJwtPayloadOrThrow(payload);
  }

  async generateJwtTokenFromUser(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.getId(),
      email: user.getEmail(),
      roles: user.getRoles(),
    };

    return await this.jwtService.signAsync<JwtPayload>(payload);
  }
}
