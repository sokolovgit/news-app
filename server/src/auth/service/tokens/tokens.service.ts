import * as dayjs from 'dayjs';

import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@/config';
import { RefreshTokensRepository } from '../abstracts/refresh-tokens.repository';
import { User } from '@/users/domain/entities';
import { TokenPair } from './types/token-pairs.type';
import { HashingService } from '../hashing-service';
import { JwtPayload } from './types/jwt-payload.type';
import { uuid } from '@/commons/utils';

import { RefreshToken } from '@/auth/domain/entities';
import { RefreshTokenId } from '@/auth/domain/schemas';
import { CreateRefreshTokenProps } from './types';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly hashingService: HashingService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async createRefreshTokenOrThrow(
    props: CreateRefreshTokenProps,
  ): Promise<RefreshToken> {
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
      throw new InternalServerErrorException('Failed to create refresh token');
    }

    return savedRefreshToken;
  }

  async deleteRefreshTokenByIdOrThrow(id: RefreshTokenId): Promise<void> {
    const isDeleted =
      await this.refreshTokensRepository.deleteRefreshTokenById(id);

    if (!isDeleted) {
      throw new InternalServerErrorException('Failed to delete refresh token');
    }
  }

  async issueTokens(user: User): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.getId(),
      email: user.getEmail(),
      roles: user.getRoles(),
    };

    const accessToken = await this.jwtService.signAsync(payload);

    let refreshToken: RefreshToken;

    const foundRefreshToken =
      await this.refreshTokensRepository.findRefreshTokenByUserId(user.getId());

    if (!foundRefreshToken) {
      refreshToken = await this.generateRefreshToken(user);
    } else {
      refreshToken = foundRefreshToken;
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(token: string): Promise<RefreshToken> {
    const hashedToken = await this.hashingService.hash(token);

    const refreshToken =
      await this.refreshTokensRepository.findRefreshTokenByToken(hashedToken);

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isExpired = dayjs().isAfter(dayjs(refreshToken.getExpiresAt()));

    if (isExpired) {
      throw new UnauthorizedException('Expired refresh token');
    }

    const user = refreshToken.getUser();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return refreshToken;
  }

  async refreshToken(token: string): Promise<TokenPair> {
    const refreshToken = await this.validateRefreshToken(token);
    await this.deleteRefreshTokenByIdOrThrow(refreshToken.getId());

    return this.issueTokens(refreshToken.getUser());
  }

  async logout(token: string): Promise<void> {
    const refreshToken = await this.validateRefreshToken(token);
    await this.deleteRefreshTokenByIdOrThrow(refreshToken.getId());
  }

  private async generateRefreshToken(user: User): Promise<RefreshToken> {
    const token = uuid();
    const hashedToken = await this.hashingService.hash(token);

    const expiresAt = dayjs()
      .add(this.configService.auth.refreshTokenExpiresInMs, 'ms')
      .toDate();

    const refreshToken = await this.createRefreshTokenOrThrow({
      userId: user.getId(),
      token: hashedToken,
      expiresAt,
      relations: { user },
    });

    return refreshToken;
  }
}
