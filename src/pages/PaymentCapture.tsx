import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import Reveal from '../components/ui/Reveal'
import { useSeo } from '../lib/useSeo'
import { paymentCaptureService } from '../services/paymentCapture.service'
import { formatApiMoney } from '../utils/apiFormat'
import type { ApiError, PaymentCaptureUploadResponse, PaymentCaptureValidateResponse } from '../types/api'

type UploadStatus = 'idle' | 'uploading' | 'received' | 'rejected' | 'pending'

/** Machine-readable OCR reasons → customer-facing copy. Unmapped reasons fall back to the raw key. */
const REASON_LABELS: Record<string, string> = {
  amount_mismatch: "The amount in your screenshot doesn't match the order total.",
  payee_missing_or_mismatch: "We couldn't confirm the payee name in the screenshot.",
  sort_code_not_found: "We couldn't find a matching sort code in the screenshot.",
  account_number_not_found: "We couldn't find a matching account number in the screenshot.",
  bank_signals_missing: "We couldn't detect bank transfer details in the image.",
  ocr_confidence_low: 'The screenshot was too unclear for us to read reliably.',
}

const ACTIONABLE_PREFIX = /(mismatch|missing|not_found|low)$/

function explainRejection(reasons: string[] | undefined): string[] {
  if (!reasons) return []
  return reasons.filter((r) => ACTIONABLE_PREFIX.test(r)).map((r) => REASON_LABELS[r] || r.replace(/_/g, ' '))
}

export default function PaymentCapture() {
  const { token } = useParams<{ token: string }>()

  useSeo({ title: 'Complete Your Payment — Jupyter Labs', path: `/payment-capture/${token ?? ''}`, noindex: true })

  const [data, setData] = useState<PaymentCaptureValidateResponse | null>(null)
  const [loading, setLoading] = useState(!!token)
  const [loadError, setLoadError] = useState(token ? '' : 'No payment link token was provided.')

  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadError, setUploadError] = useState('')
  const [uploadResult, setUploadResult] = useState<PaymentCaptureUploadResponse | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!token) return
    paymentCaptureService
      .validate(token)
      .then((res) => {
        setData(res)
        if (res.order.payment_status === 'paid') setUploadStatus('received')
      })
      .catch((err) => {
        const e = err as ApiError
        setLoadError(
          e.status === 400 || e.status === 404
            ? 'This payment link is invalid or has expired.'
            : e.serverMessage || 'Failed to load your payment details.',
        )
      })
      .finally(() => setLoading(false))
  }, [token])

  const pickFile = (f: File | null | undefined) => {
    if (f) {
      setFile(f)
      setUploadError('')
    }
  }

  const submitScreenshot = async () => {
    if (!file || !token || uploadStatus === 'uploading') return
    setUploadStatus('uploading')
    setUploadError('')
    setUploadResult(null)
    try {
      const res = await paymentCaptureService.upload(token, file)
      setUploadResult(res)
      setUploadStatus(res.payment_status)
      if (res.verification_error) setUploadError(res.verification_error)
    } catch (err) {
      const e = err as ApiError
      setUploadStatus('idle')
      setUploadError(e.serverMessage || e.message || 'Upload failed. Please try again.')
    }
  }

  const copyField = (key: string, value: string) => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopiedField(key)
      setTimeout(() => setCopiedField((k) => (k === key ? null : k)), 1600)
    })
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main id="main-content" className="relative z-10 bg-bg pt-28 lg:pt-32">
          <div className="container-x flex min-h-[50vh] items-center justify-center py-16">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent-dark" />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (loadError || !data) {
    return (
      <>
        <Navbar />
        <main id="main-content" className="relative z-10 bg-bg pt-28 lg:pt-32">
          <div className="container-x flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50">
              <XIcon className="h-7 w-7 text-red-500" />
            </div>
            <h1 className="mt-6 font-display text-3xl text-ink lg:text-4xl">Link unavailable</h1>
            <p className="mt-3 max-w-md text-sm text-muted">{loadError || 'Payment link not found.'}</p>
            <Link
              to="/track"
              className="mt-6 rounded-full border border-line px-7 py-3 text-sm text-ink transition-colors hover:border-accent-dark/40"
            >
              Track an order instead
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const { order, items, bank } = data

  if (uploadStatus === 'received') {
    return (
      <>
        <Navbar />
        <main id="main-content" className="relative z-10 bg-bg pt-28 lg:pt-32">
          <div className="container-x flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
            <Reveal>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent-dark text-bg">
                <CheckIcon className="h-7 w-7" />
              </div>
              <p className="mt-6 text-[0.65rem] uppercase tracking-[0.28em] text-accent-dark">
                Order {order.order_number}
              </p>
              <h1 className="mt-2 font-display text-4xl tracking-[-0.02em] text-ink lg:text-5xl">Payment confirmed</h1>
              <p className="mt-4 max-w-md text-sm text-muted">
                Thank you — your transfer was verified and your order is being prepared.
              </p>
              {uploadResult?.screenshotUrl && (
                <a
                  href={uploadResult.screenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-sm text-accent-dark underline underline-offset-4 hover:text-accent"
                >
                  View uploaded screenshot ↗
                </a>
              )}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to={`/track/${order.order_number}`}
                  className="rounded-full bg-accent-dark px-8 py-3.5 text-sm font-medium text-bg transition-all hover:bg-accent hover:shadow-[0_20px_40px_-20px_rgba(15,118,110,0.6)]"
                >
                  Track order
                </Link>
                <Link
                  to="/"
                  className="rounded-full border border-line px-8 py-3.5 text-sm text-ink transition-colors hover:border-accent-dark/40"
                >
                  Back to home
                </Link>
              </div>
            </Reveal>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 bg-bg pt-28 lg:pt-32">
        <div className="container-x pb-16">
          <Reveal>
            <div className="border-b border-line pb-8">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-accent-dark">Complete payment</p>
              <h1 className="mt-2 font-display text-4xl tracking-[-0.02em] text-ink lg:text-5xl">
                Order {order.order_number}
              </h1>
              <p className="mt-3 max-w-xl text-sm text-muted">
                Transfer the total below to the account, then upload a screenshot of your transfer so we can confirm
                it.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            {/* Left — order summary + amount + bank details */}
            <div className="flex flex-col gap-6">
              {items.length > 0 && (
                <Reveal className="rounded-[var(--radius-xl2)] border border-line bg-card p-6">
                  <h2 className="flex items-center gap-2 font-display text-sm text-ink">
                    <PackageIcon className="h-4 w-4 text-accent-dark" /> Order summary
                  </h2>
                  <ul className="mt-4 flex flex-col divide-y divide-line">
                    {items.map((it) => (
                      <li key={it.id} className="flex items-center justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{it.name}</p>
                          <p className="text-xs text-muted">
                            Qty {it.quantity} · {formatApiMoney(it.unit_price, order.currency)} each
                          </p>
                        </div>
                        <p className="shrink-0 text-sm text-ink">{formatApiMoney(it.line_total, order.currency)}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-1 flex flex-col gap-2 border-t border-line pt-4 text-sm">
                    <div className="flex justify-between text-muted">
                      <span>Subtotal</span>
                      <span>{formatApiMoney(order.subtotal, order.currency)}</span>
                    </div>
                    {order.discount_amount && parseFloat(order.discount_amount) > 0 && (
                      <div className="flex justify-between text-muted">
                        <span>Discount</span>
                        <span>−{formatApiMoney(order.discount_amount, order.currency)}</span>
                      </div>
                    )}
                  </div>
                </Reveal>
              )}

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[var(--radius-xl2)] bg-accent-dark p-7 text-bg"
              >
                <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-bg/70">
                  <WalletIcon className="h-3.5 w-3.5" /> Amount due
                </p>
                <p className="mt-3 font-display text-4xl tracking-tight">{formatApiMoney(order.total, order.currency)}</p>
              </motion.div>

              <Reveal className="flex flex-col gap-3 rounded-[var(--radius-xl2)] border border-line bg-section p-6">
                <BankRow
                  icon={Building2Icon}
                  label="Payee"
                  value={bank.payeeName}
                  onCopy={() => copyField('payeeName', bank.payeeName)}
                  copied={copiedField === 'payeeName'}
                />
                <BankRow
                  icon={HashIcon}
                  label="Reference"
                  value={bank.reference}
                  mono
                  onCopy={() => copyField('reference', bank.reference)}
                  copied={copiedField === 'reference'}
                />
                <BankRow
                  icon={LandmarkIcon}
                  label="Sort code"
                  value={bank.sortCode}
                  mono
                  onCopy={() => copyField('sortCode', bank.sortCode)}
                  copied={copiedField === 'sortCode'}
                />
                <BankRow
                  icon={HashIcon}
                  label="Account number"
                  value={bank.accountNumber}
                  mono
                  onCopy={() => copyField('accountNumber', bank.accountNumber)}
                  copied={copiedField === 'accountNumber'}
                />
              </Reveal>
            </div>

            {/* Right — upload proof */}
            <Reveal className="h-fit rounded-[var(--radius-xl2)] border border-line bg-section p-7 lg:sticky lg:top-28">
              <h2 className="flex items-center gap-2 font-display text-xl text-ink">
                <UploadIcon className="h-5 w-5 text-accent-dark" /> Upload payment screenshot
              </h2>
              <p className="mt-2 text-sm text-muted">PNG, JPG, or PDF · max 25 MB.</p>

              <label
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  pickFile(e.dataTransfer.files?.[0])
                }}
                className={`mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                  dragOver ? 'border-accent-dark bg-accent/5' : 'border-line bg-bg hover:border-accent-dark/40'
                }`}
              >
                <UploadIcon className={`h-7 w-7 ${dragOver ? 'text-accent-dark' : 'text-muted'}`} />
                {file ? (
                  <p className="text-sm font-medium text-ink">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-ink">Drop your screenshot here, or browse</p>
                    <p className="text-xs text-muted">Click to select a file</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                  className="hidden"
                />
              </label>

              {uploadStatus === 'pending' && uploadError && (
                <StatusBanner tone="pending" icon={ClockIcon}>
                  {uploadError}
                </StatusBanner>
              )}
              {uploadStatus !== 'pending' && uploadError && (
                <StatusBanner tone="error" icon={XIcon}>
                  {uploadError}
                </StatusBanner>
              )}
              {uploadStatus === 'rejected' && (
                <StatusBanner tone="error" icon={XIcon}>
                  <p>We couldn't verify this screenshot. Please re-upload a clearer image of the transfer.</p>
                  {explainRejection(uploadResult?.verification?.verdict.reasons).length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      {explainRejection(uploadResult?.verification?.verdict.reasons).map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </StatusBanner>
              )}

              <button
                type="button"
                onClick={submitScreenshot}
                disabled={!file || uploadStatus === 'uploading'}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent-dark py-4 text-sm font-medium text-bg transition-all hover:bg-accent hover:shadow-[0_20px_40px_-20px_rgba(15,118,110,0.6)] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <SpinnerIcon className="h-4 w-4 animate-spin" /> Uploading…
                  </>
                ) : (
                  'Submit screenshot'
                )}
              </button>
            </Reveal>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function BankRow({
  icon: Icon,
  label,
  value,
  mono = false,
  onCopy,
  copied,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  mono?: boolean
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-card px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-section text-accent-dark">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
          <p className={`truncate text-sm font-medium text-ink ${mono ? 'font-mono tracking-wide' : ''}`}>{value}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy ${label}`}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-section hover:text-accent-dark"
      >
        {copied ? <CheckSmallIcon className="h-4 w-4 text-accent-dark" /> : <CopyIcon className="h-4 w-4" />}
      </button>
    </div>
  )
}

function StatusBanner({
  tone,
  icon: Icon,
  children,
}: {
  tone: 'pending' | 'error'
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  const styles =
    tone === 'pending' ? 'border-amber-300 bg-amber-50 text-ink' : 'border-red-300 bg-red-50 text-red-700'
  const iconColor = tone === 'pending' ? 'text-amber-500' : 'text-red-500'
  return (
    <div className={`mt-4 flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-[13px] font-medium ${styles}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
      <span>{children}</span>
    </div>
  )
}

/* ── Inline icons — matches the site-wide convention of hand-rolled SVGs (no icon library). ── */

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}

function CheckSmallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8M12 13v8" />
    </svg>
  )
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
      <path d="M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a2 2 0 1 1 0-4h4a1 1 0 0 0 1-1" />
    </svg>
  )
}

function LandmarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 22h18M3 10h18M12 2 3 7h18L12 2ZM5 10v9M9.5 10v9M14.5 10v9M19 10v9" />
    </svg>
  )
}

function Building2Icon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16" />
      <path d="M14 9h5a1 1 0 0 1 1 1v11" />
      <path d="M10 6h.01M10 10h.01M10 14h.01M6 21h15" />
    </svg>
  )
}

function HashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
