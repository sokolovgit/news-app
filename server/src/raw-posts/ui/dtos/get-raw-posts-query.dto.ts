import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

import { BaseQueryDto, SortOrder } from '@/commons/types';
import { GetRawPostsRequest } from '@/raw-posts/operation/requests';
import {
  RawPostsSortField,
  RAW_POSTS_SORT_FIELDS,
} from '@/raw-posts/service/abstracts';
import { User } from '@/users/domain/entities';
import { SourceId } from '@/sources/domain/schemas';

export class GetRawPostsQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(RAW_POSTS_SORT_FIELDS)
  @ApiProperty({
    description: 'Field to sort by',
    required: false,
    enum: RAW_POSTS_SORT_FIELDS,
    default: 'createdAt',
    example: 'createdAt',
  })
  sortField?: RawPostsSortField;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: SortOrder,
    enumName: 'SortOrder',
    default: SortOrder.DESC,
    example: SortOrder.DESC,
  })
  sortOrder?: SortOrder;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').filter(Boolean);
    }
    return value;
  })
  @ApiProperty({
    description: 'Filter by source IDs (comma-separated or array)',
    required: false,
    type: [String],
    example: ['source-id-1', 'source-id-2'],
  })
  sourceIds?: SourceId[];

  toRequest(user: User): GetRawPostsRequest {
    const pagination = this.toPaginationParams();
    const dateRange = this.toDateRange();

    return {
      ...pagination,
      userId: user.getId(),
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
      sourceIds: this.sourceIds,
    } as GetRawPostsRequest;
  }
}
