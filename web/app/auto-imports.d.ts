/**
 * Auto-imports configuration
 * Nuxt 3 auto-imports components, composables, and utilities
 * This file documents the auto-imported items for better IDE support
 */

// Auto-imported from ~/config
export { APP_CONFIG } from '~/config/app.config'
export { 
  HTTP_STATUS,
  LOCAL_STORAGE_KEYS,
  SESSION_STORAGE_KEYS,
  ROUTES,
  API_ENDPOINTS,
  BREAKPOINTS,
  DATE_FORMATS,
  REGEX_PATTERNS
} from '~/config/constants'

// Auto-imported from ~/types
export type {
  // Common types
  Nullable,
  Optional,
  Maybe,
  ValueOf,
  DeepPartial,
  DeepReadonly,
  ArrayElement,
  Primitive,
  EmptyObject,
  PaginationParams,
  PaginatedResponse,
  PaginationMeta,
  SortDirection,
  SortParams,
  FilterOperator,
  FilterParam,
  ApiResponse,
  ApiError,
  ValidationError,
  LoadingState,
  AsyncState,
  FormFieldError,
  FormState,
  ThemeMode,
  ThemeConfig,
  RouteMetadata,
  BaseUser,
  Timestamps,
  SoftDelete,
  ID,
  WithId,
  SelectOption,
  Breadcrumb,
  NotificationType,
  Notification,
  Action,
  AsyncAction,
  ActionWithPayload,
  AsyncActionWithPayload,
  
  // API types
  HttpMethod,
  ApiRequestConfig,
  ListQueryParams,
  ApiErrorResponse,
  ApiClientOptions,
  UploadProgressEvent,
  UploadProgressCallback,
  FileUploadRequest,
  BatchRequest,
  BatchResponse,
} from '~/types'

// Auto-imported from ~/lib
export * from '~/lib/api'

// Auto-imported from ~/utils
export {
  validation,
  validationMessages,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize,
  formatRelativeTime,
  formatDate,
  truncate,
  capitalize,
  titleCase,
  kebabCase,
  camelCase,
  snakeCase,
  pluralize,
  formatPhoneNumber,
  maskString,
  sleep,
  generateId,
  deepClone,
  deepMerge,
  isObject,
  pick,
  omit,
  groupBy,
  unique,
  uniqueBy,
  chunk,
  flatten,
  sortBy,
  debounce,
  throttle,
  retry,
  range,
  isEmpty,
  clamp,
  random,
} from '~/utils'