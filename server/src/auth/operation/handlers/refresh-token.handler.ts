import { Injectable } from '@nestjs/common';
import { TokenPair } from '@/auth/service/tokens/types';
import { TokensService } from '@/auth/service/tokens';
import { RefreshTokenRequest } from '../requests';

@Injectable()
export class RefreshTokenHandler {
  constructor(private readonly tokensService: TokensService) {}

  async handle({ refreshToken }: RefreshTokenRequest): Promise<TokenPair> {
    return this.tokensService.refreshToken(refreshToken);
  }
}
