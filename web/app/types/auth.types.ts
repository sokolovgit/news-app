/**
 * Auth API type definitions
 * These match the server DTOs
 */

import type { UserRole } from "~/models"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface UserDto {
  id: string
  email: string
  roles: UserRole[]
}

export interface MeResponse {
  user: UserDto
  emailVerified: boolean
}

export interface AuthenticationResponse {
  user: UserDto
  accessToken: string
}

export interface ApiError {
  statusCode: number
  message: string
  error: string
  timestamp: string
  details?: Record<string, unknown>
}

