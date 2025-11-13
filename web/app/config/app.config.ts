/**
 * Application configuration constants
 * These values can be accessed throughout the application
 */

export const APP_CONFIG = {
  name: 'News App',
  version: '1.0.0',
  description: 'News Application',
  
  // Navigation
  navigation: {
    maxDepth: 3,
    mobileBreakpoint: 768,
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  
  // API
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  // Validation
  validation: {
    minPasswordLength: 8,
    maxPasswordLength: 128,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  
  // Cache
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxAge: 60 * 60 * 1000, // 1 hour
  },
  
  // Animation
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
  },
} as const

export type AppConfig = typeof APP_CONFIG

