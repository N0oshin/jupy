import { useId, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import Heading from '../components/ui/Heading'
import Reveal from '../components/ui/Reveal'
import { COUNTRIES } from '../lib/countries'
import { useSeo, SITE_URL } from '../lib/useSeo'
import { submitContactForm } from '../services/contact.service'

/* ───────────────────────── page data ───────────────────────── */

const QUANTITIES = ['50 - 100 Pens', '100 - 1,000 Pens', '1,000+ Pens'] as const

/* ───────────────────────── validation ───────────────────────── */

type Field = 'name' | 'email' | 'phone' | 'quantity' | 'country'
type Errors = Partial<Record<Field, string>>

const EMPTY = { name: '', email: '', phone: '', quantity: '', country: '' }

/** Same deliberate, permissive check the contact form uses. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(v: typeof EMPTY): Errors {
  const e: Errors = {}

  if (!v.name.trim()) e.name = 'Please enter your full name.'
  else if (v.name.trim().length < 2) e.name = 'Please enter at least 2 characters.'

  if (!v.email.trim()) e.email = 'Please enter your email address.'
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.'

  if (!v.quantity) e.quantity = 'Please select an order size.'
  if (!v.country) e.country = 'Please select a destination country.'

  // Optional — only checked when something was actually typed.
  if (v.phone.trim() && !/^[+()\d\s-]{6,20}$/.test(v.phone.trim())) {
    e.phone = 'Please enter a valid contact number, or leave this blank.'
  }

  return e
}

const inputCls =
  'w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-accent-dark disabled:opacity-60'
const invalidCls = 'border-red-500/70 focus:border-red-500'
const labelCls = 'block text-xs uppercase tracking-[0.18em] text-muted'

/* ───────────────────────── page ───────────────────────── */

export default function Wholesale() {
  useSeo({
    title: 'Wholesale Research Peptides | Jupyter Labs',
    description:
      'Wholesale and bulk research peptide supply from Jupyter Labs — tiered volume pricing, batch COA documentation and stability-grade delivery for laboratories and distributors.',
    path: '/wholesale',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${SITE_URL}/wholesale#webpage`,
      url: `${SITE_URL}/wholesale`,
      name: 'Wholesale — Jupyter Labs',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
  })

  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [formError, setFormError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const uid = useId()
  const fieldId = (f: Field) => `${uid}-${f}`
  const errorId = (f: Field) => `${uid}-${f}-error`

  function set(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
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
      const first = (['name', 'email', 'phone', 'quantity', 'country'] as Field[]).find((f) => found[f])
      if (first) formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(fieldId(first))}`)?.focus()
      return
    }

    setStatus('sending')
    setFormError(null)

    // Reuses the contact endpoint rather than adding a second mail route: the
    // structured answers are flattened into the message body so the enquiry
    // lands in the same inbox, already readable, with no server change.
    const res = await submitContactForm({
      name: values.name,
      email: values.email,
      phone: values.phone,
      subject: `Wholesale inquiry — ${values.quantity}`,
      message: [
        'Wholesale inquiry from the website.',
        '',
        `Quantity: ${values.quantity}`,
        `Country: ${values.country}`,
        `Contact number: ${values.phone.trim() || 'not provided'}`,
      ].join('\n'),
      website,
    })

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
      <main id="main-content" className="relative z-10 bg-bg pt-32 lg:pt-36">
        {/* ───── HERO + ENQUIRY FORM ───── */}
        <section className="container-x pb-20 lg:pb-28">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-accent-dark" />
            <p className="eyebrow">Wholesale</p>
          </div>

          {/* Heading, then the form stacked beneath — the form is not a sidebar.
              Matches the reference layout's single-column flow. */}
          <div className="mt-8 max-w-3xl lg:mt-10 mx-auto">
            <Heading as="h1" align="center" title={'Wholesale supply for\nresearch partners.'} />
          </div>

          <Reveal delay={0.1} className="mt-10 max-w-3xl mx-auto">
            <div className="rounded-[var(--radius-xl2)] border border-line bg-section p-7 sm:p-9">
                {status === 'sent' ? (
                  <div role="status" aria-live="polite">
                    <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full bg-accent-dark text-bg">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m4 12.5 5 5L20 6.5" />
                      </svg>
                    </span>
                    <h2 className="mt-5 font-display text-2xl text-ink">Enquiry received</h2>
                    <p className="mt-3 text-sm leading-[1.7] text-muted">
                      Thanks — your wholesale enquiry is with our team and we will reply with pricing within one
                      business day. Please check your spam folder if you don't hear back.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="mt-7 rounded-full border border-accent-dark px-6 py-3 text-sm tracking-wide text-accent-dark transition-colors hover:bg-accent-dark hover:text-bg"
                    >
                      Send another enquiry
                    </button>
                  </div>
                ) : (
                  <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextField
                        id={fieldId('name')}
                        errorId={errorId('name')}
                        label="Full name"
                        placeholder="Your full name"
                        required
                        autoComplete="name"
                        value={values.name}
                        onChange={(v) => set('name', v)}
                        onBlur={() => onBlur('name')}
                        error={errors.name}
                        disabled={busy}
                      />
                      <TextField
                        id={fieldId('email')}
                        errorId={errorId('email')}
                        label="Email"
                        placeholder="you@example.com"
                        type="email"
                        inputMode="email"
                        required
                        autoComplete="email"
                        value={values.email}
                        onChange={(v) => set('email', v)}
                        onBlur={() => onBlur('email')}
                        error={errors.email}
                        disabled={busy}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextField
                        id={fieldId('phone')}
                        errorId={errorId('phone')}
                        label="Contact Number"
                        placeholder="+44 7700 000000"
                        type="tel"
                        inputMode="tel"
                        optional
                        autoComplete="tel"
                        value={values.phone}
                        onChange={(v) => set('phone', v)}
                        onBlur={() => onBlur('phone')}
                        error={errors.phone}
                        disabled={busy}
                      />
                      <SelectField
                        id={fieldId('quantity')}
                        errorId={errorId('quantity')}
                        label="Quantity"
                        placeholder="Select quantity"
                        required
                        options={QUANTITIES}
                        value={values.quantity}
                        onChange={(v) => set('quantity', v)}
                        onBlur={() => onBlur('quantity')}
                        error={errors.quantity}
                        disabled={busy}
                      />
                    </div>

                    <SelectField
                      id={fieldId('country')}
                      errorId={errorId('country')}
                      label="Country"
                      placeholder="Select country"
                      required
                      options={COUNTRIES}
                      value={values.country}
                      onChange={(v) => set('country', v)}
                      onBlur={() => onBlur('country')}
                      error={errors.country}
                      disabled={busy}
                    />

                    {/* Honeypot — visually hidden, never announced, ignored by real users. */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label htmlFor={`${uid}-website`}>Website</label>
                      <input
                        id={`${uid}-website`}
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>

                    {formError && (
                      <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {formError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={busy}
                      className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent-dark px-7 py-3.5 text-sm tracking-wide text-bg transition-colors hover:bg-accent disabled:opacity-60"
                    >
                      {busy ? 'Sending…' : 'Submit Inquiry'}
                    </button>
                  </form>
                )}
            </div>
          </Reveal>
        </section>
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

function FieldLabel({ htmlFor, label, required, optional }: { htmlFor: string; label: string; required?: boolean; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className={labelCls}>
      {label} {required && <span className="text-accent-dark">*</span>}
      {optional && <span className="normal-case tracking-normal text-muted/70">(optional)</span>}
    </label>
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
  placeholder?: string
  type?: string
  inputMode?: 'email' | 'tel' | 'text'
  autoComplete?: string
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
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
  required = false,
  optional = false,
  disabled = false,
}: TextFieldProps) {
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} optional={optional} />
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
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

interface SelectFieldProps {
  id: string
  errorId: string
  label: string
  placeholder: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  required?: boolean
  disabled?: boolean
}

function SelectField({
  id,
  errorId,
  label,
  placeholder,
  options,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
}: SelectFieldProps) {
  return (
    <div>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <select
        id={id}
        required={required}
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`mt-2 ${inputCls} ${value ? 'text-ink' : 'text-muted/60'} ${error ? invalidCls : ''}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="text-ink">
            {o}
          </option>
        ))}
      </select>
      <FieldError id={errorId} message={error} />
    </div>
  )
}
