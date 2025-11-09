/**
 * Composable for API interactions
 * Provides a configured API client instance
 */

import { ApiClient } from '~/lib/api'

let apiClient: ApiClient | null = null

export const useApi = () => {
  const config = useRuntimeConfig()

  if (!apiClient) {
    apiClient = new ApiClient({
      baseURL: config.public.apiBaseUrl as string,
      timeout: config.public.apiTimeout as number,
      headers: {
        'Accept': 'application/json',
      },
      onRequest: async (requestConfig) => {
        // Add authentication token if available
        const token = useAuthToken()
        if (token.value) {
          requestConfig.headers = {
            ...requestConfig.headers,
            'Authorization': `Bearer ${token.value}`,
          }
        }
        return requestConfig
      },
    })
  }

  return apiClient
}

/**
 * Helper to get auth token (placeholder - implement based on your auth strategy)
 */
function useAuthToken() {
  // This is a placeholder - implement your actual auth token logic
  const token = useState<string | null>('auth-token', () => null)
  return token
}

