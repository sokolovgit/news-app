import { PaginationParams } from './pagination.type';

/**
 * Sort order direction
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Generic sort configuration
 */
export type Sort<T extends string = string> = {
  /**
   * Field to sort by
   */
  field: T;

  /**
   * Sort order (ascending or descending)
   */
  order: SortOrder;
};

/**
 * Date range filter
 */
export type DateRange = {
  /**
   * Start date (inclusive)
   */
  from?: Date;

  /**
   * End date (inclusive)
   */
  to?: Date;
};

/**
 * Base query parameters for list endpoints
 * Extend this type for specific endpoints
 */
export type BaseQueryParams = PaginationParams & {
  /**
   * Search query string
   */
  search?: string;

  /**
   * Date range filter
   */
  dateRange?: DateRange;
};

/**
 * Query parameters with sorting
 */
export type SortableQueryParams<T extends string = string> = BaseQueryParams & {
  /**
   * Sort configuration
   */
  sort?: Sort<T>;
};
