import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

import { BaseQueryDto, SortOrder } from '@/commons/types';
import { GetRawPostsRequest } from '@/posts/operation/requests';
import {
  RawPostsSortField,
  RAW_POSTS_SORT_FIELDS,
} from '@/posts/service/abstracts';
import { User } from '@/users/domain/entities';

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
    } as GetRawPostsRequest;
  }
}
