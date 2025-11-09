/**
 * Auth Store
 * Manages authentication state and provides auth methods
 */

import type { AuthUser } from '~/models/user.model'
import type { LoginRequest, RegisterRequest } from '~/types/auth.types'
import { AuthService } from '~/lib/api/auth.service'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)
  const accessToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)
  const userEmail = computed(() => user.value?.email)
  const userRoles = computed(() => user.value?.roles || [])
  const isEmailVerified = computed(() => user.value?.emailVerified || false)

  // Get auth service instance
  const authService = computed(() => {
    const api = useApi()
    console.log(api)
    return new AuthService(api)
  })

  /**
   * Initialize auth state from storage
   */
  function initAuth() {
    const token = localStorage.getItem('accessToken')
    if (token) {
      accessToken.value = token
      // Fetch user data
      fetchUser()
    }
  }

  /**
   * Fetch current user data
   */
  async function fetchUser() {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await authService.value.me()
      
      user.value = {
        id: response.user.id,
        email: response.user.email,
        roles: response.user.roles,
        emailVerified: response.emailVerified,
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user'
      console.error('Failed to fetch user:', err)
      error.value = errorMessage
      // Clear auth state on error
      clearAuth()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login user
   */
  async function login(credentials: LoginRequest) {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.value.login(credentials)
      
      // Set auth state
      accessToken.value = response.accessToken
      user.value = {
        id: response.user.id,
        email: response.user.email,
        roles: response.user.roles,
        emailVerified: false, // Will be fetched from /me endpoint
      }

      // Persist token
      localStorage.setItem('accessToken', response.accessToken)

      // Fetch full user data including email verification status
      await fetchUser()

      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      console.error('Login failed:', err)
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register new user
   */
  async function register(data: RegisterRequest) {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.value.register(data)
      
      // Set auth state
      accessToken.value = response.accessToken
      user.value = {
        id: response.user.id,
        email: response.user.email,
        roles: response.user.roles,
        emailVerified: false,
      }

      // Persist token
      localStorage.setItem('accessToken', response.accessToken)

      // Fetch full user data
      await fetchUser()

      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      console.error('Registration failed:', err)
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   */
  async function logout() {
    try {
      isLoading.value = true
      error.value = null

      await authService.value.logout()
    } catch (err: unknown) {
      console.error('Logout failed:', err)
      // Continue with logout even if API call fails
    } finally {
      clearAuth()
      isLoading.value = false
    }
  }

  /**
   * Clear auth state
   */
  function clearAuth() {
    user.value = null
    accessToken.value = null
    error.value = null
    localStorage.removeItem('accessToken')
  }

  /**
   * Refresh token
   */
  async function refreshToken() {
    try {
      const response = await authService.value.refresh()
      accessToken.value = response.accessToken
      localStorage.setItem('accessToken', response.accessToken)
      return response
    } catch (err: unknown) {
      console.error('Token refresh failed:', err)
      clearAuth()
      throw err
    }
  }

  return {
    // State
    user: readonly(user),
    accessToken: readonly(accessToken),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    isAuthenticated,
    userEmail,
    userRoles,
    isEmailVerified,
    
    // Actions
    initAuth,
    fetchUser,
    login,
    register,
    logout,
    clearAuth,
    refreshToken,
  }
})