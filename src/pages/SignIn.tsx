import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useSeo } from '../lib/useSeo'
import type { ApiError } from '../types/api'
import AuthLayout, { authInputCls, Field, PasswordField } from '../components/AuthLayout'

export default function SignIn() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') || '/'
  const { login, isAuthenticated, status } = useAuth()

  useSeo({ title: 'Sign in — Jupyter Labs', path: '/signin', noindex: true })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (status === 'authenticated') navigate(returnTo, { replace: true })
  }, [status, navigate, returnTo])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      await login({ email: email.trim().toLowerCase(), password })
      navigate(returnTo, { replace: true })
    } catch (err) {
      const httpStatus = (err as ApiError).status
      const serverMsg = (err as ApiError).serverMessage
      setError(
        httpStatus === 401 || httpStatus === 400
          ? 'Incorrect email or password.'
          : httpStatus === 429
          ? 'Too many attempts. Try again later.'
          : serverMsg || (err as Error).message || 'Could not sign in. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (isAuthenticated) return null

  return (
    <AuthLayout
      eyebrow="Researcher access"
      title="Sign in"
      subtitle="Welcome back. Sign in to review orders, certificates of analysis and account history."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Email">
          <input
            className={authInputCls}
            type="email"
            required
            autoComplete="email"
            placeholder="you@lab.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </Field>

        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          minLength={6}
          placeholder="••••••••"
          disabled={submitting}
        />

        <div className="-mt-1 text-right">
          <Link
            to="/forgot-password"
            className="text-xs uppercase tracking-[0.22em] text-accent-dark hover:text-accent"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-accent-dark px-7 py-3.5 text-sm font-medium text-bg transition-all hover:bg-accent hover:shadow-[0_20px_40px_-20px_rgba(121,13,22,0.6)] disabled:opacity-70"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-4 text-center text-sm text-muted">
          New to Jupyter Labs?{' '}
          <Link
            to={`/register${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            className="font-medium text-accent-dark hover:text-accent"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
