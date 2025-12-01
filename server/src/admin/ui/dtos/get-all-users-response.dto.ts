import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResult } from '@/commons/types';
import { User } from '@/users/domain/entities';
import { UserDto } from '@/users/ui/dtos';

export class GetAllUsersResponseDto {
  @ApiProperty({
    type: [UserDto],
    description: 'List of users',
  })
  data: UserDto[];

  @ApiProperty({
    example: 100,
    description: 'Total number of users',
  })
  total: number;

  @ApiProperty({
    example: 0,
    description: 'Offset for pagination',
  })
  offset: number;

  @ApiProperty({
    example: 20,
    description: 'Limit for pagination',
  })
  limit: number;

  static fromResponse(response: PaginatedResult<User>): GetAllUsersResponseDto {
    return {
      data: response.data.map((user) => UserDto.fromUserEntity(user)),
      total: response.total,
      offset: response.offset,
      limit: response.limit,
    };
  }
}

