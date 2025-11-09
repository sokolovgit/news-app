/**
 * Auth Service
 * Handles all authentication API calls
 */

import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthenticationResponse, 
  MeResponse 
} from '~/types/auth.types'
import type { ApiClient } from './api-client'
import type { ApiResponse } from '~/types'

export class AuthService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthenticationResponse> {
    return this.apiClient.post<AuthenticationResponse>('/auth/login', credentials)
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthenticationResponse> {
    return this.apiClient.post<AuthenticationResponse>('/auth/register', data)
  }

  /**
   * Get current user
   */
  async me(): Promise<MeResponse> {
    return this.apiClient.get<MeResponse>('/auth/me')
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    return this.apiClient.post<ApiResponse<void>>('/auth/logout')
  }

  /**
   * Refresh access token
   */
  async refresh(): Promise<AuthenticationResponse> {
    return this.apiClient.post<AuthenticationResponse>('/auth/refresh')
  }
}

