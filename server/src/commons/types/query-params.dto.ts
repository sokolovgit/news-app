import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

import { createPaginationParams, PaginationParams } from './pagination.type';
import { SortOrder, Sort, DateRange } from './query-params.type';

/**
 * Base DTO class for pagination query parameters
 * Extend this class to add pagination to your DTOs
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiProperty({
    description: 'Number of items to skip',
    required: false,
    default: 0,
    example: 0,
    minimum: 0,
  })
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    description: 'Maximum number of items to return',
    required: false,
    default: 50,
    example: 50,
    minimum: 1,
  })
  limit?: number;

  /**
   * Convert to PaginationParams with defaults applied
   */
  toPaginationParams(): PaginationParams {
    return createPaginationParams({
      offset: this.offset,
      limit: this.limit,
    });
  }
}

/**
 * DTO class for sort query parameters
 * Extend this class to add sorting to your DTOs
 */
export class SortQueryDto<T extends string = string> {
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

  /**
   * Convert to Sort object if both field and order are provided
   */
  toSort(field: T): Sort<T> | undefined {
    if (this.sortOrder) {
      return {
        field,
        order: this.sortOrder,
      };
    }
    return undefined;
  }
}

/**
 * DTO class for date range query parameters
 * Extend this class to add date filtering to your DTOs
 */
export class DateRangeQueryDto {
  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: 'Start date (ISO 8601)',
    required: false,
    example: '2024-01-01T00:00:00Z',
  })
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: 'End date (ISO 8601)',
    required: false,
    example: '2024-12-31T23:59:59Z',
  })
  dateTo?: string;

  /**
   * Convert to DateRange object
   */
  toDateRange(): DateRange | undefined {
    if (this.dateFrom || this.dateTo) {
      return {
        from: this.dateFrom ? new Date(this.dateFrom) : undefined,
        to: this.dateTo ? new Date(this.dateTo) : undefined,
      };
    }
    return undefined;
  }
}

/**
 * DTO class for search query parameter
 * Extend this class to add search to your DTOs
 */
export class SearchQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search query string',
    required: false,
    example: 'search term',
  })
  search?: string;

  /**
   * Get trimmed search string or undefined
   */
  getSearch(): string | undefined {
    return this.search?.trim() || undefined;
  }
}

/**
 * Base query DTO combining common query parameters
 * Extend this class for specific endpoints
 */
export class BaseQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search query string',
    required: false,
    example: 'search term',
  })
  search?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: 'Start date (ISO 8601)',
    required: false,
    example: '2024-01-01T00:00:00Z',
  })
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: 'End date (ISO 8601)',
    required: false,
    example: '2024-12-31T23:59:59Z',
  })
  dateTo?: string;

  /**
   * Get trimmed search string or undefined
   */
  getSearch(): string | undefined {
    return this.search?.trim() || undefined;
  }

  /**
   * Convert to DateRange object
   */
  toDateRange(): DateRange | undefined {
    if (this.dateFrom || this.dateTo) {
      return {
        from: this.dateFrom ? new Date(this.dateFrom) : undefined,
        to: this.dateTo ? new Date(this.dateTo) : undefined,
      };
    }
    return undefined;
  }
}
