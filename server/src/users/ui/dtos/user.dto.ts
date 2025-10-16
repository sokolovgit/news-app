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

  public static fromUser(user: User): UserDto {
    const dto = new UserDto();

    dto.id = user.getId();
    dto.email = user.getEmail();
    dto.roles = user.getRoles();

    return dto;
  }
}
