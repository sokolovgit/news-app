import { User } from '@/users/domain/entities';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../tokens/types';
import { UsersService } from '@/users/service/users-service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateAndGetUserOrThrow(token: string): Promise<User | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      return await this.getUserFromPayload(payload);
    } catch (error) {
      if ((error as { name?: string })?.name === 'TokenExpiredError') {
        throw new BadRequestException('Token has expired');
      } else if ((error as { name?: string })?.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid token signature');
      } else if ((error as { name?: string })?.name === 'NotBeforeError') {
        throw new BadRequestException('Token not yet valid');
      }

      throw new BadRequestException('Invalid token');
    }
  }

  private async getUserFromPayload(payload: JwtPayload): Promise<User | null> {
    return await this.usersService.getUserById(payload.sub);
  }
}
