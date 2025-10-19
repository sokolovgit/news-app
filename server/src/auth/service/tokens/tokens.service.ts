import * as dayjs from 'dayjs';

import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

import { uuid } from '@/commons/utils';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@/config';
import { HashingService } from '../hashing';

import { RefreshTokensRepository } from '../abstracts/refresh-tokens.repository';

import { CreateRefreshTokenProps, AuthTokens, JwtPayload } from './types';

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

  async issueTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.getId(),
      email: user.getEmail(),
      roles: user.getRoles(),
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const foundRefreshToken =
      await this.refreshTokensRepository.findRefreshTokenByUserId(user.getId());

    if (foundRefreshToken) {
      await this.deleteRefreshTokenByIdOrThrow(foundRefreshToken.getId());
    }

    const { plainToken } = await this.generateRefreshToken(user);

    return {
      accessToken,
      plainRefreshToken: plainToken,
    };
  }

  async validateRefreshTokenOrThrow(token: string): Promise<RefreshToken> {
    const hashedToken = this.hashingService.hashToken(token);

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

  async refreshToken(token: string): Promise<AuthenticationResult> {
    const refreshToken = await this.validateRefreshTokenOrThrow(token);
    await this.deleteRefreshTokenByIdOrThrow(refreshToken.getId());

    const user = refreshToken.getUser();
    const tokens = await this.issueTokens(user);

    return { user, tokens };
  }

  async logout(token: string): Promise<void> {
    const refreshToken = await this.validateRefreshTokenOrThrow(token);
    await this.deleteRefreshTokenByIdOrThrow(refreshToken.getId());
  }

  private async generateRefreshToken(
    user: User,
  ): Promise<{ refreshToken: RefreshToken; plainToken: string }> {
    const token = uuid();
    const hashedToken = this.hashingService.hashToken(token);

    const expiresAt = dayjs()
      .add(this.configService.auth.refreshTokenExpiresInMs, 'ms')
      .toDate();

    const refreshToken = await this.createRefreshTokenOrThrow({
      userId: user.getId(),
      token: hashedToken,
      expiresAt,
      relations: { user },
    });

    return { refreshToken, plainToken: token };
  }
}
