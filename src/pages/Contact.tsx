import { useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import Heading from '../components/ui/Heading'
import SocialLinks from '../components/ui/SocialLinks'
import { useSeo, SITE_URL } from '../lib/useSeo'
import { submitContactForm } from '../services/contact.service'

type Field = 'name' | 'email' | 'subject' | 'message' | 'phone'
type Errors = Partial<Record<Field, string>>

const EMPTY = { name: '', email: '', subject: '', message: '', phone: '' }

/**
 * Simple, deliberate email check: one @, something before it, and a dotted
 * domain after. Full RFC 5322 validation rejects addresses people actually use
 * and accepts ones no mail server will, so this only catches obvious typos and
 * lets the server be the real authority.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(values: typeof EMPTY): Errors {
  const errors: Errors = {}

  if (!values.name.trim()) errors.name = 'Please enter your full name.'
  else if (values.name.trim().length < 2) errors.name = 'Please enter at least 2 characters.'

  if (!values.email.trim()) errors.email = 'Please enter your email address.'
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Please enter a valid email address.'

  if (!values.subject.trim()) errors.subject = 'Please enter a subject.'

  if (!values.message.trim()) errors.message = 'Please enter a message.'
  else if (values.message.trim().length < 10) errors.message = 'Please give us a little more detail (10+ characters).'

  // Phone is optional — only checked when something was actually typed.
  if (values.phone.trim() && !/^[+()\d\s-]{6,20}$/.test(values.phone.trim())) {
    errors.phone = 'Please enter a valid phone number, or leave this blank.'
  }

  return errors
}

const inputCls =
  'w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-[0.8rem] text-ink placeholder:text-muted/60 transition-colors focus:border-ink focus:outline-none focus-visible:outline-none disabled:opacity-60'
const invalidCls = 'border-red-500/70 focus:border-red-500'
const labelCls = 'block text-[0.68rem] uppercase tracking-[0.18em] text-muted'
const linkCls = 'text-ink underline underline-offset-4 transition-colors hover:text-ink/70'

export default function Contact() {
  useSeo({
    title: 'Customer Service & USA Research Peptide Company',
    description:
      'Contact Jupyter Labs for customer service, technical support, order support, and business enquiries.',
    path: '/contact',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': `${SITE_URL}/contact#contactpage`,
      url: `${SITE_URL}/contact`,
      name: 'Contact Jupyter Labs',
      description:
        'Contact Jupyter Labs about certificates of analysis, batch documentation, bulk research orders or an existing order.',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
  })

  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [formError, setFormError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Unique per instance so the label/error `for`/`id` wiring stays valid even if
  // this form is ever rendered twice on one page.
  const uid = useId()
  const fieldId = (f: Field) => `${uid}-${f}`
  const errorId = (f: Field) => `${uid}-${f}-error`

  function set(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
    // Clear a field's error as soon as the visitor starts fixing it — re-running
    // full validation on every keystroke would flag fields they haven't reached.
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e))
  }

  function onBlur(field: Field) {
    const fieldError = validate(values)[field]
    setErrors((e) => ({ ...e, [field]: fieldError }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'sending') return

    const found = validate(values)
    if (Object.keys(found).some((k) => found[k as Field])) {
      setErrors(found)
      setFormError(null)
      // Move focus to the first invalid control so keyboard and screen-reader
      // users are taken straight to what needs fixing.
      const first = (['name', 'email', 'subject', 'message', 'phone'] as Field[]).find((f) => found[f])
      if (first) formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(fieldId(first))}`)?.focus()
      return
    }

    setStatus('sending')
    setFormError(null)

    const res = await submitContactForm({ ...values, website })

    if (res.ok) {
      setStatus('sent')
      setValues(EMPTY)
      setErrors({})
    } else {
      setStatus('idle')
      setFormError(res.error)
    }
  }

  const busy = status === 'sending'

  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 bg-[#fdfcf8] pt-40 lg:pt-52">
        <div className="container-x pb-16 sm:px-8 md:px-16 lg:px-28 xl:px-40">
          <Heading
            as="h1"
            eyebrow="Get in touch"
            eyebrowGap="mb-5"
            // Same type scale as the homepage sections (Difference / Craft / Benefits).
            className="[&_h1]:text-balance [&_h1]:text-[clamp(1.35rem,0.9rem+1.7vw,2.1rem)] [&_.eyebrow]:text-[1.3rem] [&_p.type-sub]:text-[0.9rem] [&_p.type-sub]:!mt-3"

  
          />

          <div className="mt-14 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            {/* ───── Form ───── */}
            <div>
              {status === 'sent' ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-xl border border-ink/30 bg-section p-8 sm:p-10"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-12 w-12 place-items-center rounded-full bg-ink text-bg"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m4 12.5 5 5L20 6.5" />
                    </svg>
                  </span>
                  <h2 className="mt-5 font-display text-2xl text-ink">Message sent</h2>
                  <p className="mt-3 max-w-md text-sm leading-[1.7] text-muted">
                    Thanks for reaching out — your message is with our team and we'll reply within one to two
                    business days.Please check your spam folder if you don't hear back.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-7 rounded-lg border border-ink px-6 py-3 text-sm tracking-wide text-ink transition-colors hover:bg-ink hover:text-bg"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5">
                  <TextField
                    id={fieldId('name')}
                    errorId={errorId('name')}
                    label="Full name"
                    required
                    autoComplete="name"
                    maxLength={80}
                    value={values.name}
                    error={errors.name}
                    disabled={busy}
                    onChange={(v) => set('name', v)}
                    onBlur={() => onBlur('name')}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField
                      id={fieldId('email')}
                      errorId={errorId('email')}
                      label="Email"
                      type="email"
                      inputMode="email"
                      required
                      autoComplete="email"
                      maxLength={120}
                      value={values.email}
                      error={errors.email}
                      disabled={busy}
                      onChange={(v) => set('email', v)}
                      onBlur={() => onBlur('email')}
                    />
                    <TextField
                      id={fieldId('phone')}
                      errorId={errorId('phone')}
                      label="Phone number"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={20}
                      optional
                      value={values.phone}
                      error={errors.phone}
                      disabled={busy}
                      onChange={(v) => set('phone', v)}
                      onBlur={() => onBlur('phone')}
                    />
                  </div>

                  <TextField
                    id={fieldId('subject')}
                    errorId={errorId('subject')}
                    label="Subject"
                    required
                    maxLength={120}
                    value={values.subject}
                    error={errors.subject}
                    disabled={busy}
                    onChange={(v) => set('subject', v)}
                    onBlur={() => onBlur('subject')}
                  />

                  <div>
                    <label htmlFor={fieldId('message')} className={labelCls}>
                      Message <span className="text-ink">*</span>
                    </label>
                    <textarea
                      id={fieldId('message')}
                      required
                      rows={6}
                      maxLength={2000}
                      value={values.message}
                      disabled={busy}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={errors.message ? errorId('message') : undefined}
                      onChange={(e) => set('message', e.target.value)}
                      onBlur={() => onBlur('message')}
                      className={`mt-2 resize-y ${inputCls} ${errors.message ? invalidCls : ''}`}
                    />
                    <FieldError id={errorId('message')} message={errors.message} />
                  </div>

                  {/* Honeypot — must stay empty. Mirrors the newsletter form. */}
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="hidden"
                    aria-hidden="true"
                  />

                  {formError && (
                    <p
                      role="alert"
                      className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600"
                    >
                      {formError}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-ink px-6 py-2.5 text-[0.8rem] tracking-wide text-bg transition-colors duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-ink/80 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {busy && (
                        <span
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin rounded-full border-2 border-bg/40 border-t-bg"
                        />
                      )}
                      {busy ? 'Sending…' : 'Send Message'}
                    </button>
                    <p className="text-[0.7rem] text-muted">
                      <span className="text-ink">*</span> Required. We only use your details to reply.
                    </p>
                  </div>

                  {/* Announces the in-flight state to assistive tech without
                      hijacking focus the way an alert() would. */}
                  <p aria-live="polite" className="sr-only">
                    {busy ? 'Sending your message' : ''}
                  </p>
                </form>
              )}
            </div>

            {/* ───── Aside ───── */}
            <aside className="lg:pt-2">
              <div className="rounded-xl border border-line p-6">
                <h2 className="font-display text-base text-ink">Before you write</h2>
                <ul className="mt-4 space-y-3 text-[0.8rem] leading-[1.6] text-muted">
                  <li>
                    Chasing an existing order?{' '}
                    <Link to="/track" className={linkCls}>
                      Track it here
                    </Link>{' '}
                    — it's usually faster than emailing.
                  </li>
                  <li>
                    After a certificate of analysis? Every batch COA is published on its own{' '}
                    <Link to="/products" className={linkCls}>
                      product page
                    </Link>
                    .
                  </li>
                  <li>
                    Returns and delivery timings are covered in our{' '}
                    <Link to="/refund-policy" className={linkCls}>
                      refund
                    </Link>{' '}
                    and{' '}
                    <Link to="/shipping-policy" className={linkCls}>
                      shipping
                    </Link>{' '}
                    policies.
                  </li>
                </ul>

                <p className="mt-5 border-t border-line pt-4 text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                  For research use only 
                </p>
              </div>

              <SocialLinks className="mt-8" />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

/* ───────────────────────── field primitives ───────────────────────── */

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-2 text-xs text-red-600">
      {message}
    </p>
  )
}

interface TextFieldProps {
  id: string
  errorId: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  type?: string
  inputMode?: 'email' | 'tel' | 'text'
  autoComplete?: string
  maxLength?: number
  required?: boolean
  optional?: boolean
  disabled?: boolean
}

function TextField({
  id,
  errorId,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  inputMode,
  autoComplete,
  maxLength,
  required = false,
  optional = false,
  disabled = false,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label} {required && <span className="text-ink">*</span>}
        {optional && <span className="normal-case tracking-normal text-muted/70">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`mt-2 ${inputCls} ${error ? invalidCls : ''}`}
      />
      <FieldError id={errorId} message={error} />
    </div>
  )
}
