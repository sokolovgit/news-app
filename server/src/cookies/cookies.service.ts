import { Injectable } from '@nestjs/common';
import { ConfigService } from '@/config';
import { Response } from 'express';
import { Request } from 'express';

@Injectable()
export class CookiesService {
  constructor(private readonly configService: ConfigService) {}

  setRefreshTokenCookie(refreshToken: string, response: Response): void {
    const maxAge = this.configService.auth.refreshTokenExpiresInMs;

    response.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: this.configService.isProduction(),
      sameSite: 'strict',
      maxAge,
    });
  }

  clearRefreshTokenCookie(response: Response): void {
    response.clearCookie('refresh-token', {
      httpOnly: true,
      secure: this.configService.isProduction(),
      sameSite: 'strict',
    });
  }

  getRefreshToken(request: Request): string | undefined {
    if (!request.cookies || typeof request.cookies !== 'object') {
      return undefined;
    }

    const refreshToken = request.cookies['refresh-token'] as string | undefined;

    if (!refreshToken || typeof refreshToken !== 'string') {
      return undefined;
    }

    return refreshToken;
  }
}
