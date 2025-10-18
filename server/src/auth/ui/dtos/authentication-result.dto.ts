import { UserDto } from '@/users/ui/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { TokenPairDto } from './token-pair.dto';
import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';

export class AuthenticationResultDto {
  @ApiProperty({
    description: 'The authenticated user',
    type: UserDto,
  })
  user: UserDto;

  @ApiProperty({
    description: 'The tokens for authenticated user',
    type: TokenPairDto,
  })
  tokens: TokenPairDto;

  constructor(props: { user: UserDto; tokens: TokenPairDto }) {
    this.user = props.user;
    this.tokens = props.tokens;
  }

  static fromAuthenticationResult(
    authenticationResult: AuthenticationResult,
  ): AuthenticationResultDto {
    const { user, tokens } = authenticationResult;

    return new AuthenticationResultDto({
      user: UserDto.fromUserEntity(user),
      tokens: TokenPairDto.fromTokenPair(tokens),
    });
  }
}
