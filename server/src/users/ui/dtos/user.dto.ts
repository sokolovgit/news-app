import { ApiProperty } from '@nestjs/swagger';
import { ApiUuidProperty } from '@/commons/docs';

import { User } from '@/users/domain/entities';
import { UserRole } from '@/users/domain/enums';

export class UserDto {
  @ApiUuidProperty({
    description: 'The unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
    format: 'email',
    type: 'string',
  })
  email: string;

  @ApiProperty({
    example: ['user'],
    description: 'The roles assigned to the user',
    isArray: true,
    enum: UserRole,
    default: [UserRole.USER],
    type: () => [UserRole],
  })
  roles: UserRole[];

  constructor(props: { id: string; email: string; roles: UserRole[] }) {
    this.id = props.id;
    this.email = props.email;
    this.roles = props.roles;
  }

  public static fromUserEntity(user: User): UserDto {
    return new UserDto({
      id: user.getId(),
      email: user.getEmail(),
      roles: user.getRoles(),
    });
  }
}
