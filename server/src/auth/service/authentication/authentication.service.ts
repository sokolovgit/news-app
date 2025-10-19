import { User } from '@/users/domain/entities';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../tokens/types';
import { UsersService } from '@/users/service/users-service';
import { TokensService } from '../tokens';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  async validateAndGetUserOrThrow(
    accessToken: string,
    refreshToken: string,
  ): Promise<User | null> {
    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(accessToken);

      const user = await this.getUserFromPayload(payload);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      await this.tokensService.validateRefreshTokenOrThrow(refreshToken);

      return user;
    } catch (error) {
      if ((error as { name?: string })?.name === 'TokenExpiredError') {
        throw new BadRequestException('Access token has expired');
      } else if ((error as { name?: string })?.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid access token signature');
      } else if ((error as { name?: string })?.name === 'NotBeforeError') {
        throw new BadRequestException('Access token not yet valid');
      } else if (
        (error as { name?: string })?.name === 'InvalidRefreshTokenError'
      ) {
        throw new BadRequestException('Invalid refresh token');
      }

      throw new BadRequestException('Invalid access token');
    }
  }

  private async getUserFromPayload(payload: JwtPayload): Promise<User | null> {
    return await this.usersService.getUserById(payload.sub);
  }
}
