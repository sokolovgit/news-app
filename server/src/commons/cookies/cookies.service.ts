import { Injectable } from '@nestjs/common';
import { ConfigService } from '@/config';
import { Response } from 'express';

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
}
