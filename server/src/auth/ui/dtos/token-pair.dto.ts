import { ApiProperty } from '@nestjs/swagger';
import { TokenPair } from '@/auth/service/tokens/types/token-pairs.type';

export class TokenPairDto {
  @ApiProperty({
    description: 'The access token for authenticated user',
    format: 'jwt',
    type: 'string',
  })
  accessToken: string;

  @ApiProperty({
    description: 'The refresh token for authenticated user',
    type: 'string',
  })
  refreshToken: string;

  constructor(props: { accessToken: string; refreshToken: string }) {
    this.accessToken = props.accessToken;
    this.refreshToken = props.refreshToken;
  }

  static fromTokenPair(tokenPair: TokenPair): TokenPairDto {
    const refreshToken = tokenPair.refreshToken.getToken();

    return new TokenPairDto({
      accessToken: tokenPair.accessToken,
      refreshToken,
    });
  }
}
