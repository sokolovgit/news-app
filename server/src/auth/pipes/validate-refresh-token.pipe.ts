import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CookiesService } from '@/cookies';

@Injectable()
export class ValidateRefreshTokenPipe implements PipeTransform {
  constructor(private readonly cookiesService: CookiesService) {}

  transform(refreshToken: string): string {
    this.validateRefreshTokenOrThrow(refreshToken);

    return refreshToken;
  }

  private validateRefreshTokenOrThrow(refreshToken: string): void {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    if (typeof refreshToken !== 'string') {
      throw new BadRequestException('Refresh token must be a string');
    }

    if (refreshToken.length === 0) {
      throw new BadRequestException('Refresh token is empty');
    }
  }
}
