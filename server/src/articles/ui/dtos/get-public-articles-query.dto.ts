import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

import { BaseQueryDto, SortOrder } from '@/commons/types';
import { GetPublicArticlesRequest } from '@/articles/operation/requests';
import {
  ArticlesSortField,
  ARTICLES_SORT_FIELDS,
} from '@/articles/service/abstracts';

export class GetPublicArticlesQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(ARTICLES_SORT_FIELDS)
  @ApiProperty({
    description: 'Field to sort by',
    required: false,
    enum: ARTICLES_SORT_FIELDS,
    default: 'publishedAt',
    example: 'publishedAt',
  })
  sortField?: ArticlesSortField;

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

  toRequest(): GetPublicArticlesRequest {
    const pagination = this.toPaginationParams();

    return {
      ...pagination,
      search: this.getSearch(),
      sort:
        this.sortField && this.sortOrder
          ? {
              field: this.sortField,
              order: this.sortOrder,
            }
          : undefined,
    };
  }
}
