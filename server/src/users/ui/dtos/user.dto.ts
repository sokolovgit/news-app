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

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'The date when the user was created',
    type: Date,
    required: false,
  })
  createdAt?: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'The date when the user was last updated',
    type: Date,
    required: false,
  })
  updatedAt?: Date;

  constructor(props: {
    id: string;
    email: string;
    roles: UserRole[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.roles = props.roles;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static fromUserEntity(user: User): UserDto {
    return new UserDto({
      id: user.getId(),
      email: user.getEmail(),
      roles: user.getRoles(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    });
  }
}
