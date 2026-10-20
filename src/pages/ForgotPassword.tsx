import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { useSeo } from '../lib/useSeo'
import type { ApiError } from '../types/api'

const inputCls =
  'w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-accent-dark focus:outline-none'

export default function ForgotPassword() {
  useSeo({ title: 'Forgot password — Jupyter Labs', path: '/forgot-password', noindex: true })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)
    setSubmitting(true)
    const normalized = email.trim().toLowerCase()
    try {
      const res = await authService.forgotPassword(normalized)
      setSentTo(normalized)
      setMessage(res.message)
    } catch (err) {
      const httpStatus = (err as ApiError).status
      const serverMsg = (err as ApiError).serverMessage
      setError(
        httpStatus === 400
          ? 'Please enter a valid email address.'
          : httpStatus === 429
          ? 'Too many attempts. Try again later.'
          : serverMsg || (err as Error).message || 'Could not send reset link. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main id="main-content" className="relative z-10 min-h-screen bg-bg">
      <div className="container-x flex min-h-screen items-center justify-center py-12 sm:py-16">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2.5 font-display text-ink"
          >
            <span className="text-2xl font-semibold lowercase tracking-[-0.015em]" style={{ fontFeatureSettings: '"ss01", "cv01"' }}>
              <span className="italic text-accent-dark">j</span>upyter
            </span>
            <span className="h-5 w-px bg-accent-dark/40" />
            <span className="text-[0.7rem] uppercase tracking-[0.34em] text-accent-dark">Labs</span>
          </Link>

          <div className="border-b border-line pb-6 text-center sm:pb-8">
            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-accent-dark">Account recovery</p>
            <h1 className="mt-2 font-display text-3xl tracking-[-0.02em] text-ink sm:text-4xl lg:text-5xl">
              Forgot password
            </h1>
            <p className="mt-3 text-sm text-muted">
              Enter the email tied to your account and we'll send a reset link. The link expires in 1 hour.
            </p>
          </div>

          {sentTo ? (
            <div className="mt-8 flex flex-col gap-6 sm:mt-10" role="status" aria-live="polite">
              <div className="rounded-2xl border border-line bg-bg/60 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-accent-dark">Check your inbox</p>
                <p className="mt-2 text-sm text-ink">
                  {message ?? 'If an account exists with this email, a password reset link has been sent.'}
                </p>
                <p className="mt-3 text-sm text-muted">
                  Sent to <span className="text-ink">{sentTo}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSentTo(null)
                  setMessage(null)
                }}
                className="rounded-full border border-line px-7 py-3 text-sm text-ink transition-colors hover:border-accent-dark hover:text-accent-dark"
              >
                Use a different email
              </button>

              <p className="text-center text-sm text-muted">
                Back to{' '}
                <Link to="/signin" className="text-accent-dark hover:text-accent">
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4 sm:mt-10">
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.22em] text-muted">Email</span>
                <input
                  className={inputCls}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@lab.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
              </label>

              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded-full bg-accent-dark px-7 py-3 text-sm text-bg transition-colors hover:bg-accent disabled:opacity-70"
              >
                {submitting ? 'Sending link…' : 'Send reset link'}
              </button>

              <p className="mt-6 text-center text-sm text-muted">
                Remembered it?{' '}
                <Link to="/signin" className="text-accent-dark hover:text-accent">
                  Back to sign in
                </Link>
              </p>
              <p className="text-center text-xs text-muted">
                For laboratory R&D use only · Not for human or veterinary consumption.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
