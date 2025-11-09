export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string
  email: string
  roles: UserRole[]
}

export interface AuthUser extends User {
  emailVerified: boolean
}

export interface AuthTokens {
  accessToken: string
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}