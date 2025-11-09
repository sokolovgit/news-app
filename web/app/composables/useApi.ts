/**
 * Composable for API interactions
 * Provides a configured API client instance integrated with auth store
 */

import { ApiClient } from '~/lib/api'
import type { ApiRequestConfig } from '~/types'

let apiClient: ApiClient | null = null

export const useApi = () => {
  const config = useRuntimeConfig()

  console.log(config.public.apiBaseUrl)

  if (!apiClient) {
    apiClient = new ApiClient({
      baseURL: config.public.apiBaseUrl as string,
      timeout: config.public.apiTimeout as number,
      withCredentials: true, // Important for cookies (refresh token)
      headers: {
        'Accept': 'application/json',
      },
    })

    // Add request interceptor to inject auth token
    const originalRequest = apiClient.request.bind(apiClient)
    apiClient.request = async function <T>(endpoint: string, requestConfig?: ApiRequestConfig): Promise<T> {
      // Get token from localStorage (synchronous)
      const token = localStorage.getItem('accessToken')
      
      if (token) {
        requestConfig = requestConfig || {}
        requestConfig.headers = {
          ...requestConfig.headers,
          'Authorization': `Bearer ${token}`,
        }
      }

      // Ensure credentials are included for cookies
      if (requestConfig) {
        requestConfig.withCredentials = true
      }

      return originalRequest(endpoint, requestConfig)
    }
  }

  return apiClient
}

