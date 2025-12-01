import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/commons/types';
import { GetAllUsersRequest } from '../../operation/requests';

export class GetAllUsersQueryDto extends PaginationQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'user@example.com',
    description: 'Search by email',
    required: false,
  })
  search?: string;

  @IsEnum(['createdAt', 'email'])
  @IsOptional()
  @ApiProperty({
    example: 'createdAt',
    description: 'Sort field',
    required: false,
    enum: ['createdAt', 'email'],
  })
  sortField?: 'createdAt' | 'email';

  @IsEnum(['asc', 'desc'])
  @IsOptional()
  @ApiProperty({
    example: 'desc',
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
  })
  sortOrder?: 'asc' | 'desc';

  toRequest(): GetAllUsersRequest {
    return {
      offset: this.offset ?? 0,
      limit: this.limit ?? 50,
      search: this.search,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
    };
  }
}

