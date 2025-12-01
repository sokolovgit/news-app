import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/commons/types';
import { GetAllArticlesRequest } from '../../operation/requests';

export class GetAllArticlesQueryDto extends PaginationQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'news',
    description: 'Search by title or description',
    required: false,
  })
  search?: string;

  @IsEnum(['createdAt', 'updatedAt', 'publishedAt'])
  @IsOptional()
  @ApiProperty({
    example: 'publishedAt',
    description: 'Sort field',
    required: false,
    enum: ['createdAt', 'updatedAt', 'publishedAt'],
  })
  sortField?: 'createdAt' | 'updatedAt' | 'publishedAt';

  @IsEnum(['asc', 'desc'])
  @IsOptional()
  @ApiProperty({
    example: 'desc',
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
  })
  sortOrder?: 'asc' | 'desc';

  toRequest(): GetAllArticlesRequest {
    return {
      offset: this.offset ?? 0,
      limit: this.limit ?? 50,
      search: this.search,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
    };
  }
}

