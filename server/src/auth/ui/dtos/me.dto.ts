import { ApiProperty } from '@nestjs/swagger';

import { UserDto } from '@/users/ui/dtos';
import { GetMeResponse } from '@/auth/operation/response';

export class MeDto {
  @ApiProperty({
    description: 'The user',
    type: UserDto,
  })
  user: UserDto;

  @ApiProperty({
    description: 'Whether the email is verified',
    type: 'boolean',
    example: true,
  })
  emailVerified: boolean;

  constructor(props: { user: UserDto; emailVerified: boolean }) {
    this.user = props.user;
    this.emailVerified = props.emailVerified;
  }

  static fromGetMeResponse(response: GetMeResponse): MeDto {
    return new MeDto({
      user: UserDto.fromUserEntity(response.user),
      emailVerified: response.emailVerified,
    });
  }
}
