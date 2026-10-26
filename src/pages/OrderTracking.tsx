import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import { useSeo } from '../lib/useSeo'
import { orderService } from '../services/order.service'
import { formatApiMoney, toBool } from '../utils/apiFormat'
import type { ApiError, OrderDetailResponse } from '../types/api'

/** Order lifecycle for the timeline. `cancelled` is handled as a terminal state. */
const TIMELINE = ['pending', 'processing', 'completed'] as const

function statusIndex(status: string): number {
  const s = status.toLowerCase()
  if (s === 'cancelled' || s === 'canceled') return -1
  const i = TIMELINE.indexOf(s as (typeof TIMELINE)[number])
  return i === -1 ? 0 : i
}

/** Sample payload for the dev-only /track/DEMO preview. */
const DEMO_ORDER = {
  order: {
    id: 0,
    order_number: 'ORD-DEMO-0001',
    user_id: null,
    customer_email: 'jane.doe@example.com',
    customer_name: 'Jane Doe',
    customer_phone: '+1 555 010 0199',
    shipping_address: '123 Research Way',
    shipping_city: 'Austin',
    shipping_state: 'TX',
    shipping_zip: '78701',
    shipping_country: 'United States',
    tracking_number: '9400 1000 0000 0000 0000 00',
    currency: 'USD',
    subtotal: '180.00',
    shipping: '0.00',
    total: '162.00',
    status: 'processing',
    payment_status: 'paid',
    payment_method: 'Card',
    promo_code: 'WELCOME10',
    promo_discount: '10',
    discount_amount: '18.00',
    bank_account_used: null,
    created_at: new Date().toISOString(),
    updated_at: null,
    total_before_discount: '180.00',
    total_after_discount: '162.00',
    promo_discount_percent: '10',
    promo_valid: 1,
    items_text: null,
    credits_applied: null,
    total_before_credits: null,
    credits_reserved: null,
  },
  items: [
    { id: 1, order_id: 0, product_id: 1, name: 'Tirzepatide 40mg Pen', sku: 'TZP-40', quantity: 1, unit_price: '120.00', line_total: '120.00' },
    { id: 2, order_id: 0, product_id: 2, name: 'Tesamorelin 10mg Pen', sku: 'TSM-10', quantity: 1, unit_price: '60.00', line_total: '60.00' },
  ],
  payments: [],
} as unknown as OrderDetailResponse

/**
 * Fetch an order by number. Dev-only: /track/DEMO returns the sample order
 * without calling the API (stripped from production builds).
 */
function fetchOrder(code: string): Promise<OrderDetailResponse> {
  if (import.meta.env.DEV && code.toUpperCase() === 'DEMO') return Promise.resolve(DEMO_ORDER)
  return orderService.getByNumber(code)
}

function lookupErrorMessage(err: unknown): string {
  const e = err as ApiError
  return e.status === 404
    ? "We couldn't find an order with that number. Please double-check and try again."
    : e.serverMessage || 'Something went wrong looking up your order. Please try again.'
}

const inputCls =
  'w-full rounded-2xl border border-line bg-transparent px-4 py-3 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-ink focus:outline-none'

export default function OrderTracking() {
  const { orderNumber: paramOrder } = useParams<{ orderNumber: string }>()
  const navigate = useNavigate()

  const [input, setInput] = useState(paramOrder ?? '')
  const [data, setData] = useState<OrderDetailResponse | null>(null)
  const [loading, setLoading] = useState(Boolean(paramOrder))
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(Boolean(paramOrder))

  useSeo({ title: 'Track Your Order — Jupyter Labs', path: '/track', noindex: true })

  /** Manual submit: reset the result panel, then fetch. */
  const lookup = useCallback(async (orderNumber: string) => {
    const code = orderNumber.trim()
    if (!code) {
      setError('Please enter your order number.')
      return
    }
    setLoading(true)
    setError(null)
    setData(null)
    setSearched(true)
    try {
      setData(await fetchOrder(code))
    } catch (err) {
      setError(lookupErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  // When the URL param changes (/track/A -> /track/B) reset the panel during
  // render; the initial state above already covers the first mount.
  const [lastParam, setLastParam] = useState(paramOrder)
  if (lastParam !== paramOrder) {
    setLastParam(paramOrder)
    if (paramOrder) {
      setInput(paramOrder)
      setLoading(true)
      setError(null)
      setData(null)
      setSearched(true)
    }
  }

  // Auto-lookup when arriving at /track/:orderNumber. State is only touched
  // from the promise callbacks, and a stale response is ignored if the param
  // changes again before it lands.
  useEffect(() => {
    window.scrollTo(0, 0)
    if (!paramOrder) return
    let cancelled = false
    fetchOrder(paramOrder)
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(lookupErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [paramOrder])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    const code = input.trim()
    if (code && code !== paramOrder) navigate(`/track/${encodeURIComponent(code)}`)
    else void lookup(code)
  }

  const order = data?.order
  const idx = order ? statusIndex(order.status) : 0
  const cancelled = order ? idx === -1 : false

  return (
    <>
      <Navbar />
      {/* Fills the monitor height so the footer only shows once the user
          scrolls; the search block sits vertically centred until a result
          loads and the page grows naturally. */}
      <main id="main-content" className="relative z-10 flex min-h-[100svh] flex-col bg-bg pt-28 lg:pt-32">
        <div className="container-x flex flex-1 flex-col justify-center pb-16">
          {/* Header: heading beside the illustration */}
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-ink">Order Tracking</p>
              <h1 className="mt-2 font-display text-4xl tracking-[-0.02em] text-ink lg:text-5xl">Track your order</h1>
              <p className="mt-3 max-w-xl text-sm text-muted">
                Enter the order number from your confirmation email (e.g. <span className="text-ink">ORD-…</span>) to see its
                current status.
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-[36rem] overflow-hidden rounded-[var(--radius-xl2)] bg-bg lg:mx-0 lg:ml-auto lg:max-w-[42rem]">
              <img
                src="/images/ecom/bg/img2.jpg"
                alt=""
                width={1600}
                height={842}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="w-full select-none mix-blend-multiply"
              />
            </div>
          </div>

          {/* Search */}
          <form onSubmit={onSubmit} className="mt-2 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              className={inputCls}
              placeholder="Order number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Order number"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 rounded-lg bg-ink px-7 py-3 text-sm font-medium text-bg transition-all hover:bg-ink/80 disabled:opacity-70"
            >
              {loading ? 'Searching…' : 'Track order'}
            </button>
          </form>

          {/* Error / empty states */}
          {error && (
            <p className="mt-6 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          {loading && (
            <div className="mt-10 flex items-center gap-3 text-sm text-muted" role="status" aria-live="polite">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-ink" />
              Looking up your order…
            </div>
          )}

          {/* Result */}
          {order && !loading && (
            <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
              {/* Left: status + items */}
              <div className="flex flex-col gap-10">
                {/* Status timeline */}
                <section className="rounded-[var(--radius-xl2)] border border-line p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.6rem] uppercase tracking-[0.22em] text-muted">Order</p>
                      <p className="mt-1 font-display text-lg text-ink">{order.order_number}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${
                        cancelled
                          ? 'bg-red-100 text-red-700'
                          : idx >= 2
                            ? 'bg-ink text-bg'
                            : 'bg-bg text-ink'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {cancelled ? (
                    <p className="mt-6 text-sm text-muted">This order was cancelled. Contact support if you believe this is an error.</p>
                  ) : (
                    <ol className="mt-8 grid grid-cols-3 gap-3">
                      {TIMELINE.map((step, i) => (
                        <li key={step}>
                          <div className="h-[3px] w-full overflow-hidden rounded-full bg-line">
                            <div className={`h-full rounded-full bg-ink transition-[width] duration-700 ${i <= idx ? 'w-full' : 'w-0'}`} />
                          </div>
                          <span className={`mt-3 block text-xs capitalize tracking-wide ${i <= idx ? 'text-ink' : 'text-muted'}`}>
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}

                  <dl className="mt-8 grid gap-x-6 gap-y-4 border-t border-line pt-6 sm:grid-cols-2">
                    <Field label="Payment status" value={order.payment_status} />
                    <Field label="Payment method" value={order.payment_method} />
                    <Field label="Tracking number" value={order.tracking_number || 'Not yet assigned'} />
                    <Field label="Order date" value={new Date(order.created_at).toLocaleDateString('en-GB')} />
                  </dl>
                </section>

                {/* Purchased products */}
                <section>
                  <h2 className="font-display text-xl text-ink">Purchased products</h2>
                  <ul className="mt-5 flex flex-col divide-y divide-line rounded-[var(--radius-xl2)] border border-line">
                    {data!.items.map((it) => (
                      <li key={it.id} className="flex items-center justify-between gap-4 p-5">
                        <div>
                          <p className="font-display text-sm text-ink">{it.name}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {it.sku ? `${it.sku} · ` : ''}Qty {it.quantity} · {formatApiMoney(it.unit_price, order.currency)} each
                          </p>
                        </div>
                        <p className="text-sm text-ink">{formatApiMoney(it.line_total, order.currency)}</p>
                      </li>
                    ))}
                    {data!.items.length === 0 && <li className="p-5 text-sm text-muted">No line items recorded for this order.</li>}
                  </ul>
                </section>
              </div>

              {/* Right: summary + customer + address */}
              <aside className="flex h-fit flex-col gap-6 lg:sticky lg:top-28">
                <section className="rounded-[var(--radius-xl2)] border border-line bg-card p-7">
                  <h2 className="font-display text-xl text-ink">Summary</h2>
                  <dl className="mt-6 space-y-3 text-sm">
                    <Row label="Subtotal" value={formatApiMoney(order.subtotal, order.currency)} />
                    {order.discount_amount && !moneyIsZero(order.discount_amount) && (
                      <Row label={`Discount${order.promo_code ? ` (${order.promo_code})` : ''}`} value={`−${formatApiMoney(order.discount_amount, order.currency)}`} accent />
                    )}
                    <div className="my-3 h-px bg-line" />
                    <Row label="Total" value={formatApiMoney(order.total, order.currency)} strong />
                  </dl>
                  {order.promo_valid != null && (
                    <p className="mt-4 text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                      Promo {toBool(order.promo_valid) ? 'applied' : 'not applied'}
                    </p>
                  )}
                </section>

                <section className="rounded-[var(--radius-xl2)] border border-line bg-card p-7">
                  <h2 className="font-display text-sm uppercase tracking-[0.2em] text-ink">Customer</h2>
                  <div className="mt-4 space-y-1 text-sm text-muted">
                    <p className="text-ink">{order.customer_name}</p>
                    <p>{order.customer_email}</p>
                    {order.customer_phone && <p>{order.customer_phone}</p>}
                  </div>
                </section>

                <section className="rounded-[var(--radius-xl2)] border border-line p-7">
                  <h2 className="font-display text-sm uppercase tracking-[0.2em] text-ink">Address</h2>
                  <address className="mt-4 space-y-1 text-sm not-italic text-muted">
                    {order.shipping_address && <p>{order.shipping_address}</p>}
                    <p>{[order.shipping_city, order.shipping_zip].filter(Boolean).join(', ')}</p>
                    {order.shipping_country && <p>{order.shipping_country}</p>}
                  </address>
                </section>
              </aside>
            </div>
          )}

          {/* Not-found state after a search with no result and no error handled above */}
          {searched && !loading && !order && !error && (
            <p className="mt-10 text-sm text-muted">No order found. Please check the number and try again.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function moneyIsZero(v: string | null): boolean {
  return v == null || parseFloat(v) === 0
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.6rem] uppercase tracking-[0.22em] text-muted">{label}</dt>
      <dd className="mt-1 text-sm capitalize text-ink">{value}</dd>
    </div>
  )
}

function Row({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? 'font-display text-lg' : ''}`}>
      <dt className="text-muted">{label}</dt>
      <dd className={accent ? 'text-accent' : 'text-ink'}>{value}</dd>
    </div>
  )
}
