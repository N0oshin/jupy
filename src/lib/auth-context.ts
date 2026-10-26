import { createContext } from 'react'
import type { LoginRequest, RegisterRequest, User } from '../types/api'

export type AuthStatus = 'loading' | 'authenticated' | 'guest'

export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (creds: LoginRequest) => Promise<User>
  register: (body: RegisterRequest) => Promise<User>
  logout: () => void
  /** Re-hydrate from /api/auth/verify (used on mount + manual refresh). */
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
