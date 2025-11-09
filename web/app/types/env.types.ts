/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * Environment variable types
 * This ensures type safety for environment variables
 */

export interface PublicRuntimeConfig {
  appName: string
  appUrl: string
  appEnv: 'development' | 'staging' | 'production'
  apiBaseUrl: string
  apiTimeout: number
  featureAnalytics: boolean
  featureDebugMode: boolean
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig extends PublicRuntimeConfig {}
}

export {}

