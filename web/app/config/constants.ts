/**
 * Application-wide constants
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

export const LOCAL_STORAGE_KEYS = {
  THEME: 'news-app-theme',
  AUTH_TOKEN: 'news-app-auth-token',
  USER_PREFERENCES: 'news-app-user-preferences',
  RECENT_SEARCHES: 'news-app-recent-searches',
} as const

export const SESSION_STORAGE_KEYS = {
  RETURN_URL: 'news-app-return-url',
  TEMP_DATA: 'news-app-temp-data',
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  NEWS: {
    LIST: '/news',
    DETAIL: (id: string) => `/news/${id}`,
    CREATE: '/news',
    UPDATE: (id: string) => `/news/${id}`,
    DELETE: (id: string) => `/news/${id}`,
  },
} as const

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME_ONLY: 'HH:mm',
} as const

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  PHONE: /^[\d\s()+-]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const

