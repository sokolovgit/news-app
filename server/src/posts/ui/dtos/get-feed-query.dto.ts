import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsEnum, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

import { BaseQueryDto } from '@/commons/types';
import { GetFeedRequest } from '@/posts/operation/requests';
import { User } from '@/users/domain/entities';
import { SourceId } from '@/sources/domain/schemas';

/**
 * Sortable fields for feed posts
 */
export type FeedSortField = 'createdAt' | 'updatedAt';

export class GetFeedQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((id: string) => id.trim());
    }
    return value as SourceId[];
  })
  @ApiProperty({
    description: 'Filter by source IDs (comma-separated)',
    required: false,
    type: [String],
    example: ['uuid1', 'uuid2'],
  })
  sourceIds?: string[];

  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt'])
  @ApiProperty({
    description: 'Field to sort by',
    required: false,
    enum: ['createdAt', 'updatedAt'],
    default: 'createdAt',
    example: 'createdAt',
  })
  sortField?: FeedSortField;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  sortOrder?: 'asc' | 'desc';

  toRequest(user: User): GetFeedRequest {
    const pagination = this.toPaginationParams();
    const dateRange = this.toDateRange();

    return {
      ...pagination,
      userId: user.getId(),
      sourceIds: this.sourceIds as SourceId[] | undefined,
      search: this.getSearch(),
      sort:
        this.sortField && this.sortOrder
          ? {
              field: this.sortField,
              order: this.sortOrder,
            }
          : undefined,
      dateFrom: dateRange?.from,
      dateTo: dateRange?.to,
    } as GetFeedRequest;
  }
}
