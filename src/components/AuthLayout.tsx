import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * Shared layout for the auth pages (Sign in / Create account).
 *
 * A full-bleed photograph fills the viewport, the wordmark sits top-left, and
 * the form lives in a single frosted card centred on screen: icon badge, title,
 * one line of copy, pill inputs with leading icons, a dark primary button and
 * a row of social sign-in tiles beneath a dotted divider.
 */

export const authInputCls =
  'w-full rounded-xl border border-transparent bg-[#f1f3f6] px-4 py-3 text-sm text-ink placeholder:text-[#8a8f98] transition-all duration-200 focus:border-ink/20 focus:bg-white focus:outline-none focus:ring-4 focus:ring-ink/5 disabled:opacity-60'

function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5 font-display text-ink">
      <span
        className="text-2xl font-semibold lowercase tracking-[-0.015em]"
        style={{ fontFeatureSettings: '"ss01", "cv01"' }}
      >
        <span className="italic text-accent-dark">j</span>upyter
      </span>
      <span className="h-5 w-px bg-accent-dark/40" />
      <span className="text-[0.7rem] uppercase tracking-[0.34em] text-accent-dark">Labs</span>
    </span>
  )
}

interface AuthLayoutProps {
  title: string
  subtitle: string
  /** Glyph shown in the badge above the title. */
  icon?: 'signin' | 'register'
  /** Label on the dotted divider above the social tiles. */
  socialLabel?: string
  children: ReactNode
  /** Width of the card; the register form needs a little more room. */
  wide?: boolean
}

export default function AuthLayout({
  title,
  subtitle,
  icon = 'signin',
  socialLabel = 'Or sign in with',
  wide = false,
  children,
}: AuthLayoutProps) {
  // Gentle entrance for the card — CSS-only, no animation library pulled onto
  // these lazily-loaded routes.
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <main
      id="main-content"
      className="relative z-10 flex min-h-screen flex-col overflow-hidden bg-[#dbeefb] px-5 py-6 sm:px-8"
    >
      {/* Backdrop photograph */}
      <img
        src="/images/ecom/bg/bg8.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-white/10" />

      <Link to="/" className="inline-flex self-start" data-cursor aria-label="Jupyter Labs — back to home">
        <Wordmark />
      </Link>

      <div className="flex flex-1 items-center justify-center py-8">
        <div
          className={`w-full rounded-[1.6rem] border border-white/70 bg-white/85 px-6 py-8 shadow-[0_30px_80px_-30px_rgba(20,50,80,0.45)] backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-8 ${
            wide ? 'max-w-lg' : 'max-w-[23rem]'
          } ${shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
        >
          {/* Icon badge */}
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-[0_10px_30px_-12px_rgba(20,50,80,0.4),0_0_0_1px_rgba(20,50,80,0.06)]">
            {icon === 'signin' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6" />
                <path d="M22 11h-6" />
              </svg>
            )}
          </div>

          <h1 className="mt-5 text-center text-[1.45rem] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
          <p className="mx-auto mt-2 max-w-[26ch] text-center text-sm leading-relaxed text-[#6b7280]">{subtitle}</p>

          <div className="mt-6">{children}</div>

          {/* Social row */}
          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 border-t border-dotted border-[#c9ced6]" />
            <span className="text-[0.68rem] text-[#8a8f98]">{socialLabel}</span>
            <span className="h-px flex-1 border-t border-dotted border-[#c9ced6]" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <SocialTile label="Google">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
                <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3a7.2 7.2 0 0 1-10.8-3.8H1.3v3.1A12 12 0 0 0 12 24z" />
                <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
                <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1C6.2 6.9 8.9 4.8 12 4.8z" />
              </svg>
            </SocialTile>
            <SocialTile label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="12" fill="#1877F2" />
                <path fill="#fff" d="M16.7 15.5l.5-3.5h-3.3V9.8c0-1 .5-1.9 2-1.9h1.5v-3s-1.4-.2-2.7-.2c-2.7 0-4.5 1.6-4.5 4.6V12H7.1v3.5h3.1V24a12 12 0 0 0 3.7 0v-8.5h2.8z" />
              </svg>
            </SocialTile>
            <SocialTile label="Apple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-ink" aria-hidden="true">
                <path d="M16.4 12.7c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-3.8zM14 5.5c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z" />
              </svg>
            </SocialTile>
          </div>
        </div>
      </div>

      <p className="text-center text-[0.65rem] uppercase tracking-[0.2em] text-ink/55">
        For laboratory R&amp;D use only · Not for human use
      </p>
    </main>
  )
}

/** Social provider tile. Not wired to a provider yet, so it is disabled. */
function SocialTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      disabled
      title={`${label} sign-in coming soon`}
      aria-label={`Continue with ${label} (coming soon)`}
      className="grid h-10 place-items-center rounded-xl border border-[#e3e6ea] bg-white shadow-[0_1px_2px_rgba(20,50,80,0.06)] transition-all hover:border-ink/25 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}

export type FieldIcon = 'mail' | 'lock' | 'user' | 'calendar' | 'globe' | 'flag'

function Glyph({ icon }: { icon: FieldIcon }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (icon) {
    case 'mail':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )
    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
      )
    case 'flag':
      return (
        <svg {...common}>
          <path d="M4 22V4a1 1 0 0 1 1-1h11l-1 4 1 4H5" />
        </svg>
      )
  }
}

/**
 * Field wrapper matching the card rhythm: the label is visually hidden (the
 * placeholder carries it, as in the reference) and an optional leading icon
 * sits inside the pill.
 */
export function Field({ label, icon, children }: { label: string; icon?: FieldIcon; children: ReactNode }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[#8a8f98]">
          <Glyph icon={icon} />
        </span>
      )}
      <span className={icon ? 'block [&_input]:pl-10 [&_select]:pl-10' : 'block'}>{children}</span>
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
    <Field label={label} icon="lock">
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
          className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#8a8f98] transition-colors hover:text-ink focus-visible:text-ink"
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          tabIndex={-1}
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <path d="M1 1l22 22" />
            </svg>
          )}
        </button>
      </div>
    </Field>
  )
}
