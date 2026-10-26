import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
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
      icon="signin"
      title="Sign in with email"
      subtitle="Welcome back. Review orders, certificates of analysis and account history."
      socialLabel="Or sign in with"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Field label="Email" icon="mail">
          <input
            className={authInputCls}
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
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
          placeholder="Password"
          disabled={submitting}
        />

        <div className="-mt-1 text-right">
          <Link to="/forgot-password" className="text-xs text-ink/70 hover:text-ink">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 rounded-xl bg-ink px-6 py-3 text-sm font-medium text-white shadow-[0_12px_24px_-12px_rgba(42,15,18,0.6)] transition-all hover:bg-accent-dark disabled:opacity-70"
        >
          {submitting ? 'Signing in…' : 'Get Started'}
        </button>

        <p className="mt-2 text-center text-xs text-[#6b7280]">
          New to Jupyter Labs?{' '}
          <Link
            to={`/register${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            className="font-medium text-ink hover:text-accent-dark"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
