import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * Shared premium layout for the auth pages (Sign in / Create account).
 *
 * A two-column split: a branded teal panel carrying the wordmark, a line of
 * positioning and the trust signals the rest of the site leans on, beside a
 * clean form column. The brand panel is desktop-only; on smaller screens the
 * form takes the full width with a compact logo header. Visual language —
 * palette, Space Grotesk, grain texture, rounded-2xl fields — is unchanged from
 * the marketing site so the experience feels continuous.
 */

export const authInputCls =
  'w-full rounded-2xl border border-line bg-bg px-4 py-3.5 text-sm text-ink placeholder:text-muted/50 shadow-[0_1px_2px_rgba(20,32,42,0.04)] transition-all duration-200 focus:border-accent-dark focus:outline-none focus:ring-4 focus:ring-accent/15 disabled:opacity-60'

const TRUST = [
  'HPLC-verified purity on every batch',
  'Batch-specific Certificate of Analysis',
  'Lot-level traceability, end to end',
  'Independent third-party lab testing',
]

function Wordmark({ tone = 'ink' }: { tone?: 'ink' | 'bg' }) {
  const primary = tone === 'bg' ? 'text-bg' : 'text-ink'
  const accent = tone === 'bg' ? 'text-bg/85' : 'text-accent-dark'
  return (
    <span className={`inline-flex items-center gap-2.5 font-display ${primary}`}>
      <span
        className="text-2xl font-semibold lowercase tracking-[-0.05em]"
        style={{ fontFeatureSettings: '"ss01", "cv01"' }}
      >
        <span className={`italic ${accent}`}>j</span>upyter
      </span>
      <span className={`h-5 w-px ${tone === 'bg' ? 'bg-bg/40' : 'bg-accent-dark/40'}`} />
      <span className={`text-[0.7rem] uppercase tracking-[0.34em] ${accent}`}>Labs</span>
    </span>
  )
}

interface AuthLayoutProps {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
}

export default function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  // Gentle entrance for the form column — CSS-only, no animation library pulled
  // onto these lazily-loaded routes.
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <main id="main-content" className="relative z-10 min-h-screen bg-bg lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ───── Brand panel (desktop) ───── */}
      <aside className="relative hidden overflow-hidden bg-accent-dark text-bg lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <img
          src="/images/jupyter-labs/jupyter-labs-research-facility.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.18]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-dark via-accent-dark/95 to-ink/90" />
        <div className="absolute inset-0 grain opacity-20" />
        <div className="pointer-events-none absolute -right-28 top-1/4 h-96 w-96 rounded-full bg-accent/25 blur-[130px]" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-gold/15 blur-[120px]" />

        <div className="relative z-10">
          <Link to="/" data-cursor aria-label="Jupyter Labs — back to home">
            <Wordmark tone="bg" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-[clamp(1.9rem,2.6vw,2.75rem)] font-light leading-[1.12] tracking-[-0.02em]">
            Research-grade peptides, documented to the milligram.
          </h2>
          <ul className="mt-9 space-y-4">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm text-bg/85">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-bg/10 ring-1 ring-bg/20">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7.5L5.5 11L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[0.7rem] uppercase tracking-[0.24em] text-bg/55">
          For laboratory R&amp;D use only · Not for human or veterinary use
        </p>
      </aside>

      {/* ───── Form panel ───── */}
      <div className="flex min-h-screen flex-col px-5 py-10 sm:px-8 lg:min-h-0 lg:justify-center lg:px-14 xl:px-20">
        <Link to="/" className="mb-10 inline-flex lg:hidden" data-cursor aria-label="Jupyter Labs — back to home">
          <Wordmark />
        </Link>

        <div
          className={`mx-auto w-full max-w-md transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
        >
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-accent-dark">{eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl tracking-[-0.02em] text-ink sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 border-t border-line pt-6 text-center text-[0.7rem] uppercase tracking-[0.2em] text-muted lg:hidden">
            For laboratory R&amp;D use only · Not for human use
          </p>
        </div>
      </div>
    </main>
  )
}

/** Labelled field wrapper matching the auth form rhythm. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.22em] text-muted">{label}</span>
      {children}
    </label>
  )
}

interface PasswordFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete: string
  placeholder?: string
  minLength?: number
  disabled?: boolean
  required?: boolean
}

/** Password input with an accessible show/hide toggle. */
export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength,
  disabled,
  required = true,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false)
  return (
    <Field label={label}>
      <div className="relative">
        <input
          className={`${authInputCls} pr-12`}
          type={show ? 'text' : 'password'}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:text-accent-dark focus-visible:text-accent-dark"
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          tabIndex={-1}
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <path d="M1 1l22 22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </Field>
  )
}
