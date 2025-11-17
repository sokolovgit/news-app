/**
 * Pagination request parameters
 */
export type PaginationParams = {
  /**
   * Number of items to skip (offset)
   * @default 0
   */
  offset: number;

  /**
   * Maximum number of items to return
   * @default 50
   */
  limit: number;
};

/**
 * Pagination result with data and metadata
 */
export type PaginatedResult<T> = {
  /**
   * The paginated data items
   */
  data: T[];

  /**
   * Total number of items available (not just in this page)
   */
  total: number;

  /**
   * Number of items skipped (offset)
   */
  offset: number;

  /**
   * Maximum number of items requested
   */
  limit: number;

  /**
   * Whether there are more items available
   */
  hasMore: boolean;
};

/**
 * Default pagination parameters
 */
export const DEFAULT_PAGINATION: PaginationParams = {
  offset: 0,
  limit: 50,
};

/**
 * Create pagination parameters with defaults
 */
export function createPaginationParams(
  params?: Partial<PaginationParams>,
): PaginationParams {
  return {
    ...DEFAULT_PAGINATION,
    ...params,
  };
}

/**
 * Create paginated result
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  const hasMore = params.offset + data.length < total;

  return {
    data,
    total,
    offset: params.offset,
    limit: params.limit,
    hasMore,
  };
}
