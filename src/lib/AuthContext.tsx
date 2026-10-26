import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/api'
import { getToken, setToken as persistToken, clearToken, UNAUTHORIZED_EVENT } from './authToken'

/**
 * Loaded on demand rather than imported at module scope.
 *
 * AuthProvider wraps every route, so a static import drags the service layer and
 * the whole of axios into the landing page's initial bundle — where a signed-out
 * visitor never calls any of it (`refresh` returns early when there is no token).
 * Deferring it keeps that weight off the critical path that gates LCP.
 */
const loadAuthService = () => import('../services/auth.service').then((m) => m.authService)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // No token means there is nothing to verify, so start as a guest instead of
  // flipping from 'loading' inside an effect.
  const [status, setStatus] = useState<AuthStatus>(() => (getToken() ? 'loading' : 'guest'))

  const applyAuth = useCallback((res: AuthResponse) => {
    persistToken(res.token)
    setUser(res.user)
    setStatus('authenticated')
    return res.user
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setStatus('guest')
  }, [])

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setStatus('guest')
      return
    }
    try {
      const { user } = await (await loadAuthService()).verify()
      setUser(user)
      setStatus('authenticated')
    } catch {
      // Invalid/expired token — verify already triggered a 401 clear.
      clearToken()
      setUser(null)
      setStatus('guest')
    }
  }, [])

  // Session restore on load (only when there is a token to check). State is
  // only touched from the promise callbacks, never synchronously in the effect.
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    loadAuthService()
      .then((svc) => svc.verify())
      .then(({ user }) => {
        if (cancelled) return
        setUser(user)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        // Invalid/expired token — verify already triggered a 401 clear.
        clearToken()
        setUser(null)
        setStatus('guest')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // React to a 401 from anywhere in the app (interceptor emits this).
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null)
      setStatus('guest')
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const login = useCallback(
    async (creds: LoginRequest) => applyAuth(await (await loadAuthService()).login(creds)),
    [applyAuth],
  )
  const register = useCallback(
    async (body: RegisterRequest) => applyAuth(await (await loadAuthService()).register(body)),
    [applyAuth],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, isAuthenticated: status === 'authenticated', login, register, logout, refresh }),
    [user, status, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
