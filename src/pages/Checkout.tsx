import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import { PRODUCTS } from '../lib/content'
import { useCart, formatPrice } from '../lib/CartContext'
import { useAuth } from '../lib/AuthContext'
import { orderService } from '../services/order.service'
import { emailService } from '../services/email.service'
import { promoService } from '../services/promo.service'
import type { ApiError } from '../types/api'
import { useSeo } from '../lib/useSeo'

type Form = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  postcode: string
  country: string
}

const COUNTRIES = ['United Kingdom', 'Ireland', 'France', 'Germany', 'Netherlands', 'Spain', 'Other (EU)']

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clear } = useCart()
  const { user } = useAuth()

  useSeo({ title: 'Checkout — Jupyter Labs', path: '/checkout', noindex: true })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (items.length === 0) {
      const t = setTimeout(() => navigate('/cart'), 200)
      return () => clearTimeout(t)
    }
  }, [items.length, navigate])

  const [form, setForm] = useState<Form>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  })

  // Pre-fill from the signed-in account so a manual-payment order's
  // customer_email matches the account email — otherwise it can never show
  // up under My Orders, which looks orders up by email. Only fills fields
  // still blank, so it never overwrites something the customer already typed.
  useEffect(() => {
    if (!user) return
    setForm((f) => ({
      ...f,
      firstName: f.firstName || user.name?.split(' ')[0] || '',
      lastName: f.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: f.email || user.email || '',
      phone: f.phone || user.phone || '',
    }))
  }, [user])

  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<{ code: string; percent: number } | null>(null)
  const [promoBusy, setPromoBusy] = useState(false)
  const [promoMsg, setPromoMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [showPopup, setShowPopup] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string
    total: number
    email: string
    /**
     * Reflects the companion email server (server/index.js) — the process that
     * actually sends the branded confirmation. It starts as 'sending' because
     * the order succeeds before the mail does, and the customer should not be
     * told the mail failed while it is still in flight.
     */
    emailStatus: 'sending' | 'sent' | 'failed'
    emailError: string | null
  } | null>(null)

  const lineItems = items
    .map((i) => {
      const p = PRODUCTS.find((p) => p.id === i.id)
      return p ? { ...i, product: p } : null
    })
    .filter(Boolean) as { id: string; qty: number; product: (typeof PRODUCTS)[number] }[]

  const shipping = 0
  const discount = promo ? Math.round((subtotal * promo.percent) / 100 * 100) / 100 : 0
  const total = Math.max(0, subtotal + shipping - discount)

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function applyPromo() {
    const code = promoInput.trim()
    if (!code) {
      setPromoMsg({ tone: 'err', text: 'Enter a code.' })
      return
    }
    setPromoBusy(true)
    setPromoMsg(null)
    try {
      const res = await promoService.validate(code)
      setPromo({ code: code.toUpperCase(), percent: res.percent })
      setPromoMsg({ tone: 'ok', text: `${res.percent}% off applied.` })
    } catch (e) {
      const status = (e as ApiError).status
      setPromo(null)
      setPromoMsg({
        tone: 'err',
        text: status === 404 ? 'Invalid code.' : (e as Error).message || 'Could not validate code.',
      })
    } finally {
      setPromoBusy(false)
    }
  }

  function clearPromo() {
    setPromo(null)
    setPromoInput('')
    setPromoMsg(null)
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)
    const normalizedEmail = form.email.trim().toLowerCase()
    try {
      const res = await orderService.create({
        email: normalizedEmail,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        customerName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        phone: form.phone.trim(),
        address: [form.address1.trim(), form.address2.trim()].filter(Boolean).join(', '),
        city: form.city.trim(),
        postcode: form.postcode.trim(),
        country: form.country,
        promoCode: promo?.code,
        promoDiscount: promo?.percent,
        subtotal,
        discountAmount: discount,
        total,
        items: lineItems.map(({ product, qty }) => ({
          productId: product.id,
          name: product.name,
          sku: product.slug,
          quantity: qty,
          unitPrice: product.price,
        })),
        paymentMethod: 'manual',
      })
      // NB: res.email_debug.orderConfirmation is the *shared backend's* own mail
      // attempt. This brand does not send confirmations that way — server/index.js
      // does, via the call below — so email_debug is only logged for diagnostics
      // and must not drive what the customer is told. Reading it was reporting a
      // failed send while the real one was succeeding.
      if (res.email_debug) {
        console.debug('[checkout] backend email_debug (not the send we rely on):', res.email_debug)
      }

      // Show the confirmation as soon as the order is safe. The email is still in
      // flight at this point, so it starts as 'sending' rather than 'failed'.
      setConfirmedOrder({
        orderNumber: res.orderNumber,
        total,
        email: normalizedEmail,
        emailStatus: 'sending',
        emailError: null,
      })
      setShowPopup(true)

      // The send that actually delivers the branded mail. Built from the API's own
      // persisted record (via a getByNumber refetch), not local form/cart state, so
      // it reflects what was saved server-side. Never throws — it reports instead.
      const mail = await emailService.sendOrderConfirmationEmail(res.orderNumber)
      setConfirmedOrder((prev) =>
        prev && prev.orderNumber === res.orderNumber
          ? { ...prev, emailStatus: mail.ok ? 'sent' : 'failed', emailError: mail.error }
          : prev,
      )
    } catch (err) {
      const e = err as Error & { status?: number }
      console.error('Order submission failed:', e.status, e.message)
      const friendly =
        e.status && e.status >= 500
          ? "We couldn't process your order right now — your card was not charged. Please try again in a moment, or contact support@jupyterlabs.example.com if it persists."
          : e.message || 'Could not place your order. Please check your details and try again.'
      setSubmitError(friendly)
    } finally {
      setSubmitting(false)
    }
  }

  function closeAndGoHome() {
    setShowPopup(false)
    clear()
    navigate('/')
  }

  const inputCls =
    'w-full rounded-2xl border border-line bg-transparent px-4 py-3 text-[0.8125rem] text-ink placeholder:text-muted/60 transition-colors focus:border-accent-dark focus:outline-none'

  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 bg-[#fdfcf8] pt-28 lg:pt-32">
        <div className="container-x pb-16">
          <div className="border-b border-line pb-8">
            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-accent-dark">Checkout</p>
            <h1 className="mt-2 font-display text-4xl tracking-[-0.02em] text-ink lg:text-5xl">Complete your order</h1>
            <Link to="/cart" className="mt-3 inline-block text-[0.8125rem] text-[#3b1f14] hover:text-[#5a3220]">
              ← Back to cart
            </Link>
          </div>

          <form onSubmit={placeOrder} className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
            {/* Form column */}
            <div className="flex flex-col gap-10">
              <section>
                <h2 className="font-display text-xl text-ink">Contact</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <input className={inputCls} required maxLength={50} placeholder="First name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                  <input className={inputCls} required maxLength={50} placeholder="Last name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                  <input className={inputCls} required maxLength={50} type="email" placeholder="Email address" value={form.email} onChange={(e) => set('email', e.target.value)} />
                  <input className={inputCls} required maxLength={50} type="tel" placeholder="Mobile number" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </div>
              </section>

              <section>
                <h2 className="font-display text-xl text-ink">Address</h2>
                <div className="mt-5 grid gap-4">
                  <input className={inputCls} required maxLength={50} placeholder="Address line 1" value={form.address1} onChange={(e) => set('address1', e.target.value)} />
                  <input className={inputCls} maxLength={50} placeholder="Address line 2 (optional)" value={form.address2} onChange={(e) => set('address2', e.target.value)} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className={inputCls} required maxLength={50} placeholder="City" value={form.city} onChange={(e) => set('city', e.target.value)} />
                    <input className={inputCls} required maxLength={50} placeholder="Postcode" value={form.postcode} onChange={(e) => set('postcode', e.target.value)} />
                  </div>
                  <select
                    className={inputCls}
                    value={form.country}
                    onChange={(e) => set('country', e.target.value)}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </section>

              <div className="rounded-2xl bg-bg px-4 py-3 text-xs leading-relaxed text-muted">
                <p>
                  By proceeding with this purchase, you acknowledge that these products are intended solely for laboratory
                  research purposes and are not intended for human or veterinary use.
                </p>
                <p className="mt-2">These products are not intended to diagnose, treat, cure, or prevent any disease.</p>
              </div>
            </div>

            {/* Summary column */}
            <aside className="h-fit rounded-[var(--radius-xl2)] bg-bg p-7 lg:sticky lg:top-28">
              <h2 className="font-display text-xl text-ink">Order summary</h2>

              <ul className="mt-6 flex flex-col gap-4 border-b border-line pb-6">
                {lineItems.map(({ product, qty }) => (
                  <li key={product.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0">
                      <div className="h-full w-full overflow-hidden rounded-xl border border-line bg-bg">
                        <img src={product.image} alt={product.name} className="h-full w-full object-contain p-1.5" />
                      </div>
                      <span className="absolute -right-2 -top-2 z-10 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-ink px-1 text-[0.65rem] font-semibold text-bg shadow-sm ring-2 ring-bg">
                        {qty}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-[0.8125rem] text-ink">{product.name}</p>
                      <p className="text-xs text-muted">{product.category}</p>
                    </div>
                    <p className="text-[0.8125rem] text-ink">{formatPrice(product.price * qty, product.currency)}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {promo ? (
                  <div className="flex items-center justify-between rounded-2xl border border-accent-dark/30 bg-bg px-4 py-3 text-[0.8125rem]">
                    <span className="text-ink">
                      <span className="font-medium">{promo.code}</span>{' '}
                      <span className="text-muted">· {promo.percent}% off</span>
                    </span>
                    <button type="button" onClick={clearPromo} className="text-xs uppercase tracking-[0.2em] text-muted hover:text-accent-dark">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-stretch gap-2">
                    <input
                      className={inputCls}
                      placeholder="Discount code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo() } }}
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      disabled={promoBusy}
                      className="rounded-2xl border border-line bg-bg px-5 text-[0.8125rem] text-ink transition-colors hover:border-accent-dark/40 disabled:opacity-60"
                    >
                      {promoBusy ? '…' : 'Apply'}
                    </button>
                  </div>
                )}
                {promoMsg && (
                  <p className={`mt-2 text-xs ${promoMsg.tone === 'ok' ? 'text-accent-dark' : 'text-red-600'}`}>
                    {promoMsg.text}
                  </p>
                )}
              </div>

              <dl className="mt-6 space-y-3 text-[0.8125rem]">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="text-ink">{formatPrice(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Discount</dt>
                    <dd className="text-accent-dark">−{formatPrice(discount)}</dd>
                  </div>
                )}
                <div className="my-4 h-px bg-line" />
                <div className="flex justify-between font-display text-lg">
                  <dt className="text-ink">Total</dt>
                  <dd className="text-ink">{formatPrice(total)}</dd>
                </div>
              </dl>

              {submitError && (
                <p className="mt-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-xs text-red-700">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-7 w-full rounded-full bg-[#3b1f14] py-3.5 text-[0.8125rem] font-medium text-bg transition-all hover:bg-[#5a3220] hover:shadow-[0_20px_40px_-20px_rgba(59,31,20,0.6)] disabled:opacity-70"
              >
                {submitting ? 'Placing order…' : 'Place Order'}
              </button>
              <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-muted">
                By placing this order you confirm these products are for laboratory research use only — not for human or
                veterinary use.
              </p>
              <Link to="/cart" className="mt-4 block text-center text-[0.8125rem] text-[#3b1f14] hover:text-[#5a3220]">
                Back to cart
              </Link>
            </aside>
          </form>
        </div>
      </main>
      <Footer />

      {/* Order confirmation popup */}
      <AnimatePresence>
        {showPopup && confirmedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
            onClick={closeAndGoHome}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-xl2)] bg-bg p-8 text-center shadow-[0_40px_80px_-20px_rgba(121,13,22,0.35)]"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent-dark text-bg">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </div>
              <h3 className="mt-6 font-display text-2xl tracking-[-0.02em] text-ink">Order placed</h3>
              <p className="mt-2 text-[0.8125rem] text-muted">
                Thanks {form.firstName || 'researcher'} — we've received your order.{' '}
                {confirmedOrder.emailStatus === 'sending' && (
                  <>
                    Your order was saved successfully. We're sending your confirmation to{' '}
                    <span className="text-ink">{confirmedOrder.email}</span> now…
                  </>
                )}
                {confirmedOrder.emailStatus === 'sent' && (
                  <>
                    A confirmation email is on its way to{' '}
                    <span className="text-ink">{confirmedOrder.email}</span>. If it doesn't arrive within a few
                    minutes, please check your spam folder.
                  </>
                )}
                {confirmedOrder.emailStatus === 'failed' && (
                  <>Your order was saved successfully, so no need to place it again.</>
                )}
              </p>

              {confirmedOrder.emailStatus === 'failed' && (
                <div
                  role="alert"
                  className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-left text-xs text-amber-800"
                >
                  <p className="font-semibold uppercase tracking-[0.2em]">Confirmation email pending</p>
                  <p className="mt-2 text-[0.75rem] leading-relaxed">
                    We couldn't send the confirmation to{' '}
                    <span className="font-medium">{confirmedOrder.email}</span> right now. Please save
                    your order number below and contact{' '}
                    <a href="mailto:support@jupyterlabs.example.com" className="underline">
                      support@jupyterlabs.example.com
                    </a>{' '}
                    if you don't receive it within an hour. You can also track this order at{' '}
                    <Link to={`/track/${confirmedOrder.orderNumber}`} className="underline">
                      /track/{confirmedOrder.orderNumber}
                    </Link>
                    .
                  </p>
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-line bg-section p-4 text-left">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-muted">
                  <span>Order #</span>
                  <span className="text-ink">{confirmedOrder.orderNumber}</span>
                </div>
                <div className="mt-3 flex items-center justify-between font-display text-base">
                  <span className="text-ink">Total paid</span>
                  <span className="text-ink">{formatPrice(confirmedOrder.total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAndGoHome}
                className="mt-7 w-full rounded-full bg-[#3b1f14] py-3.5 text-[0.8125rem] font-medium text-bg transition-colors hover:bg-[#5a3220]"
              >
                Continue shopping
              </button>

              <p className="mt-5 text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                For laboratory R&D use only
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
