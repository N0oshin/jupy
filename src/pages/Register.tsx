import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import { useSeo } from '../lib/useSeo'
import type { ApiError, RegisterRequest } from '../types/api'
import AuthLayout, { authInputCls, Field, PasswordField } from '../components/AuthLayout'

const COUNTRIES = [
  'United Kingdom',
  'Ireland',
  'United States',
  'Canada',
  'France',
  'Germany',
  'Netherlands',
  'Spain',
  'Italy',
  'Sweden',
  'Denmark',
  'Norway',
  'Australia',
  'New Zealand',
  'Japan',
  'Singapore',
  'Other',
]

const NATIONALITIES = [
  'British',
  'Irish',
  'American',
  'Canadian',
  'French',
  'German',
  'Dutch',
  'Spanish',
  'Italian',
  'Swedish',
  'Danish',
  'Norwegian',
  'Australian',
  'New Zealander',
  'Japanese',
  'Singaporean',
  'Other',
]

type Form = RegisterRequest & { confirmPassword: string }

export default function Register() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') || '/'
  const { register, isAuthenticated, status } = useAuth()

  useSeo({ title: 'Create account — Jupyter Labs', path: '/register', noindex: true })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (status === 'authenticated') navigate(returnTo, { replace: true })
  }, [status, navigate, returnTo])

  const [form, setForm] = useState<Form>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    date_of_birth: '',
    nationality: 'British',
    country_of_residence: 'United Kingdom',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        date_of_birth: form.date_of_birth,
        nationality: form.nationality,
        country_of_residence: form.country_of_residence,
      })
      navigate(returnTo, { replace: true })
    } catch (err) {
      const httpStatus = (err as ApiError).status
      const serverMsg = (err as ApiError).serverMessage
      setError(
        httpStatus === 409
          ? 'An account with this email already exists.'
          : httpStatus === 400
          ? serverMsg || 'Please check the form and try again.'
          : httpStatus === 429
          ? 'Too many attempts. Try again later.'
          : serverMsg || (err as Error).message || 'Could not create account. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (isAuthenticated) return null

  const today = new Date().toISOString().split('T')[0]

  return (
    <AuthLayout
      icon="register"
      title="Create your account"
      subtitle="Access certificates of analysis, order history and members-only research notes."
      socialLabel="Or sign up with"
      wide
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Field label="Full name" icon="user">
          <input
            className={authInputCls}
            required
            maxLength={80}
            autoComplete="name"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            disabled={submitting}
          />
        </Field>

        <Field label="Email" icon="mail">
          <input
            className={authInputCls}
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            disabled={submitting}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <PasswordField
            label="Password"
            value={form.password}
            onChange={(v) => set('password', v)}
            autoComplete="new-password"
            minLength={8}
            placeholder="Password"
            disabled={submitting}
          />
          <PasswordField
            label="Confirm password"
            value={form.confirmPassword}
            onChange={(v) => set('confirmPassword', v)}
            autoComplete="new-password"
            minLength={8}
            placeholder="Confirm password"
            disabled={submitting}
          />
        </div>

        <Field label="Date of birth" icon="calendar">
          <input
            className={authInputCls}
            type="date"
            required
            max={today}
            value={form.date_of_birth}
            onChange={(e) => set('date_of_birth', e.target.value)}
            disabled={submitting}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nationality" icon="flag">
            <select
              className={authInputCls}
              required
              value={form.nationality}
              onChange={(e) => set('nationality', e.target.value)}
              disabled={submitting}
            >
              {NATIONALITIES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </Field>
          <Field label="Country of residence" icon="globe">
            <select
              className={authInputCls}
              required
              value={form.country_of_residence}
              onChange={(e) => set('country_of_residence', e.target.value)}
              disabled={submitting}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
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
          {submitting ? 'Creating account…' : 'Get Started'}
        </button>

        <p className="mt-2 text-center text-xs text-[#6b7280]">
          Already have an account?{' '}
          <Link
            to={`/signin${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            className="font-medium text-ink hover:text-accent-dark"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
