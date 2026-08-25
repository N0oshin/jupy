import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import { useAuth } from '../lib/AuthContext'
import { useSeo } from '../lib/useSeo'
import { orderService } from '../services/order.service'
import { formatApiMoney } from '../utils/apiFormat'
import type { ApiError, Order } from '../types/api'

export default function MyOrders() {
  const { user, isAuthenticated, status } = useAuth()

  useSeo({ title: 'My Orders — Jupyter Labs', path: '/orders', noindex: true })

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = useCallback(async (email: string) => {
    setLoading(true)
    try {
      const res = await orderService.getByEmail(email)
      setOrders(res.orders)
    } catch (err) {
      const e = err as ApiError
      setError(e.serverMessage || 'Failed to load your orders.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (user?.email) void loadOrders(user.email)
  }, [user?.email, loadOrders])

  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 bg-bg pt-28 lg:pt-32">
        <div className="container-x pb-16">
          <div className="border-b border-line pb-8">
            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-accent-dark">Account</p>
            <h1 className="mt-2 font-display text-4xl tracking-[-0.02em] text-ink lg:text-5xl">My orders</h1>
            <p className="mt-3 max-w-xl text-sm text-muted">Every order placed with this account, newest first.</p>
          </div>

          {status === 'loading' && (
            <div className="mt-10 flex items-center gap-3 text-sm text-muted" role="status" aria-live="polite">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent-dark" />
              Loading…
            </div>
          )}

          {status !== 'loading' && !isAuthenticated && (
            <div className="mt-10 max-w-md rounded-[var(--radius-xl2)] border border-line bg-section p-7">
              <p className="text-sm text-muted">Sign in to see your order history.</p>
              <Link
                to="/signin"
                className="mt-5 inline-block rounded-full bg-accent-dark px-7 py-3 text-sm font-medium text-bg transition-all hover:bg-accent"
              >
                Sign in
              </Link>
            </div>
          )}

          {isAuthenticated && loading && (
            <div className="mt-10 flex items-center gap-3 text-sm text-muted" role="status" aria-live="polite">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent-dark" />
              Loading your orders…
            </div>
          )}

          {error && (
            <p className="mt-6 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          {isAuthenticated && !loading && !error && orders && orders.length === 0 && (
            <div className="mt-10 max-w-md rounded-[var(--radius-xl2)] border border-line bg-section p-7">
              <p className="text-sm text-muted">
                No orders found for {user?.email}. If you checked out with a different email, track it directly with
                the order number from your confirmation email instead.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="inline-block rounded-full bg-accent-dark px-7 py-3 text-sm font-medium text-bg transition-all hover:bg-accent"
                >
                  Browse products
                </Link>
                <Link
                  to="/track"
                  className="inline-block rounded-full border border-line px-7 py-3 text-sm text-ink transition-colors hover:border-accent-dark/40"
                >
                  Track an order
                </Link>
              </div>
            </div>
          )}

          {isAuthenticated && !loading && orders && orders.length > 0 && (
            <ul className="mt-10 flex flex-col gap-4">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/track/${order.order_number}`}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-xl2)] border border-line bg-card p-6 transition-colors hover:border-accent-dark/40"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-sm text-ink">{order.order_number}</p>
                      <p className="mt-1 text-xs text-muted">
                        {new Date(order.created_at).toLocaleDateString('en-GB')} · {order.payment_status}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="rounded-full bg-section px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-accent-dark">
                        {order.status}
                      </span>
                      <span className="text-sm font-medium text-ink">{formatApiMoney(order.total, order.currency)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
