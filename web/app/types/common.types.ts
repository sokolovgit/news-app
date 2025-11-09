/**
 * Common type definitions used across the application
 */

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type Maybe<T> = T | null | undefined

export type ValueOf<T> = T[keyof T]

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

export type ArrayElement<T> = T extends (infer U)[] ? U : never

export type Primitive = string | number | boolean | null | undefined

export type EmptyObject = Record<string, never>

/**
 * Pagination types
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Sort types
 */
export type SortDirection = 'asc' | 'desc'

export interface SortParams<T = string> {
  field: T
  direction: SortDirection
}

/**
 * Filter types
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'nin'

export interface FilterParam<T = unknown> {
  field: string
  operator: FilterOperator
  value: T
}

/**
 * API Response types
 */
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  timestamp: string
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
  errors?: ValidationError[]
  timestamp: string
}

export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

/**
 * Loading state types
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T, E = Error> {
  data: Nullable<T>
  error: Nullable<E>
  loading: boolean
  state: LoadingState
}

/**
 * Form types
 */
export interface FormFieldError {
  field: string
  message: string
}

export interface FormState<T = Record<string, unknown>> {
  values: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  dirty: boolean
  valid: boolean
  submitting: boolean
}

/**
 * Theme types
 */
export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  mode: ThemeMode
  primaryColor?: string
  borderRadius?: string
}

/**
 * Route types
 */
export interface RouteMetadata {
  title?: string
  description?: string
  requiresAuth?: boolean
  layout?: string
  roles?: string[]
}

/**
 * User types (basic structure)
 */
export interface BaseUser {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

/**
 * Timestamp types
 */
export interface Timestamps {
  createdAt: string
  updatedAt: string
}

export interface SoftDelete {
  deletedAt: Nullable<string>
}

/**
 * ID types
 */
export type ID = string | number

export interface WithId {
  id: ID
}

/**
 * Select option type
 */
export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
  description?: string
}

/**
 * Breadcrumb type
 */
export interface Breadcrumb {
  label: string
  to?: string
  icon?: string
}

/**
 * Notification types
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  dismissible?: boolean
}

/**
 * Utility types for actions
 */
export type Action<T = void> = () => T
export type AsyncAction<T = void> = () => Promise<T>
export type ActionWithPayload<P, T = void> = (payload: P) => T
export type AsyncActionWithPayload<P, T = void> = (payload: P) => Promise<T>

