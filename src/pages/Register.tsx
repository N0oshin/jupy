import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
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
      eyebrow="Researcher access"
      title="Create your account"
      subtitle="Join Jupyter Labs to access certificates of analysis, order history and members-only research notes."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Full name">
          <input
            className={authInputCls}
            required
            maxLength={80}
            autoComplete="name"
            placeholder="Dr. Ada Lovelace"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            disabled={submitting}
          />
        </Field>

        <Field label="Email">
          <input
            className={authInputCls}
            type="email"
            required
            autoComplete="email"
            placeholder="you@lab.com"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            disabled={submitting}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="Password"
            value={form.password}
            onChange={(v) => set('password', v)}
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
            disabled={submitting}
          />
          <PasswordField
            label="Confirm password"
            value={form.confirmPassword}
            onChange={(v) => set('confirmPassword', v)}
            autoComplete="new-password"
            minLength={8}
            placeholder="Repeat password"
            disabled={submitting}
          />
        </div>

        <Field label="Date of birth">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nationality">
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
          <Field label="Country of residence">
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
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-accent-dark px-7 py-3.5 text-sm font-medium text-bg transition-all hover:bg-accent hover:shadow-[0_20px_40px_-20px_rgba(121,13,22,0.6)] disabled:opacity-70"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link
            to={`/signin${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            className="font-medium text-accent-dark hover:text-accent"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
