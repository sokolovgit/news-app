import { UserDto } from '@/users/ui/dtos';
import { ApiProperty } from '@nestjs/swagger';
import { AuthenticationResult } from '@/auth/service/local-auth/types/authentication-result.type';

export class AuthenticationResultDto {
  @ApiProperty({
    description: 'The user associated with the authentication result',
    type: UserDto,
  })
  user: UserDto;

  @ApiProperty({
    description: 'The access token for authenticated user',
    format: 'jwt',
    type: 'string',
  })
  accessToken: string;

  constructor(props: { user: UserDto; accessToken: string }) {
    this.user = props.user;
    this.accessToken = props.accessToken;
  }

  static fromAuthenticationResult(
    authenticationResult: AuthenticationResult,
  ): AuthenticationResultDto {
    const { user, tokens } = authenticationResult;

    return new AuthenticationResultDto({
      user: UserDto.fromUserEntity(user),
      accessToken: tokens.accessToken,
    });
  }
}
