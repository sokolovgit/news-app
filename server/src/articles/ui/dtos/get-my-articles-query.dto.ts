import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';

import { BaseQueryDto, SortOrder } from '@/commons/types';
import { User } from '@/users/domain/entities';
import { GetMyArticlesRequest } from '@/articles/operation/requests';
import {
  ArticlesSortField,
  ARTICLES_SORT_FIELDS,
} from '@/articles/service/abstracts';
import { ArticleStatus } from '@/articles/domain/enums';

export class GetMyArticlesQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(ArticleStatus)
  @ApiProperty({
    description: 'Filter by article status',
    required: false,
    enum: ArticleStatus,
    example: ArticleStatus.DRAFT,
  })
  status?: ArticleStatus;

  @IsOptional()
  @IsEnum(ARTICLES_SORT_FIELDS)
  @ApiProperty({
    description: 'Field to sort by',
    required: false,
    enum: ARTICLES_SORT_FIELDS,
    default: 'createdAt',
    example: 'createdAt',
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

  toRequest(user: User): GetMyArticlesRequest {
    const pagination = this.toPaginationParams();

    return {
      ...pagination,
      userId: user.getId(),
      status: this.status,
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
