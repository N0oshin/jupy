import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import { PRODUCTS } from '../lib/content'
import { useCart, formatPrice } from '../lib/CartContext'
import { useSeo } from '../lib/useSeo'

export default function Cart() {
  const { items, subtotal, setQty, remove, clear } = useCart()
  const navigate = useNavigate()

  useSeo({ title: 'Your Cart — Jupyter Labs', path: '/cart', noindex: true })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const lineItems = items
    .map((i) => {
      const p = PRODUCTS.find((p) => p.id === i.id)
      return p ? { ...i, product: p } : null
    })
    .filter(Boolean) as { id: string; qty: number; product: (typeof PRODUCTS)[number] }[]

  const shipping = lineItems.length ? 0 : 0
  const total = subtotal + shipping

  function checkout() {
    navigate('/checkout')
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 bg-[#fdfcf8] pt-28 lg:pt-32">
        <div className="container-x pb-16">
          <div className="flex items-end justify-between border-b border-line pb-8">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-accent-dark">Your Cart</p>
              <h1 className="mt-2 font-display text-4xl tracking-[-0.02em] text-ink lg:text-5xl">
                {lineItems.length ? `${lineItems.length} ${lineItems.length === 1 ? 'item' : 'items'}` : 'Cart is empty'}
              </h1>
            </div>
            <Link to="/#products" className="hidden text-sm text-accent-dark hover:text-accent md:inline-block">
              ← Back to Shop
            </Link>
          </div>

          {lineItems.length === 0 ? (
            <div className="mt-12 flex flex-col items-center justify-center rounded-[var(--radius-xl2)] border border-line bg-section py-14 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-bg text-accent-dark">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21 8H6" />
                  <circle cx="9" cy="20" r="1.5" />
                  <circle cx="18" cy="20" r="1.5" />
                </svg>
              </div>
              <p className="mt-5 font-display text-xl text-ink">No research products yet</p>
              <p className="mt-2 text-sm text-muted">Explore our catalogue and add a compound to get started.</p>
              <Link to="/#products" className="mt-8 rounded-full bg-accent-dark px-6 py-3 text-sm text-bg transition-colors hover:bg-accent">
                Continue shopping
              </Link>
            </div>
          ) : (
            <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
              {/* Line items */}
              <ul className="flex flex-col gap-4">
                {lineItems.map(({ product, qty }) => (
                  <li
                    key={product.id}
                    className="flex flex-col gap-4 rounded-[var(--radius-xl2)] border border-line bg-card p-5 sm:flex-row sm:items-center"
                  >
                    <Link
                      to={`/products/${product.slug}`}
                      className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-section"
                    >
                      <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-contain p-3" />
                    </Link>

                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.22em] text-muted">{product.category}</p>
                        <Link to={`/products/${product.slug}`} className="mt-1 block font-display text-lg text-ink hover:text-accent-dark">
                          {product.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted">{product.stat}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                        <div className="flex items-center rounded-full border border-line">
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty - 1)}
                            className="grid h-10 w-10 place-items-center text-ink hover:text-accent-dark"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm">{qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty + 1)}
                            className="grid h-10 w-10 place-items-center text-ink hover:text-accent-dark"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <p className="w-20 text-right font-display text-base text-ink">
                          {formatPrice(product.price * qty, product.currency)}
                        </p>
                        <button
                          type="button"
                          onClick={() => remove(product.id)}
                          className="text-xs uppercase tracking-[0.2em] text-muted hover:text-accent-dark"
                          aria-label={`Remove ${product.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={clear}
                    className="text-xs uppercase tracking-[0.2em] text-muted hover:text-accent-dark"
                  >
                    Clear cart
                  </button>
                </div>
              </ul>

              {/* Summary */}
              <aside className="h-fit rounded-[var(--radius-xl2)] border border-line bg-section p-7 lg:sticky lg:top-28">
                <h2 className="font-display text-xl text-ink">Order summary</h2>

                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd className="text-ink">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="my-4 h-px bg-line" />
                  <div className="flex justify-between font-display text-lg">
                    <dt className="text-ink">Total</dt>
                    <dd className="text-ink">{formatPrice(total)}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={checkout}
                  className="mt-7 w-full rounded-full bg-accent-dark py-3.5 text-sm font-medium text-bg transition-all hover:bg-accent hover:shadow-[0_20px_40px_-20px_rgba(121,13,22,0.6)]"
                >
                  Checkout
                </button>
                <Link to="/#products" className="mt-4 block text-center text-sm text-accent-dark hover:text-accent">
                  Continue shopping
                </Link>

                <div className="mt-7 border-t border-line pt-5 text-[0.7rem] leading-relaxed text-muted">
                  <p>
                    By proceeding to checkout, you acknowledge that these products are intended solely for laboratory research
                    purposes and are not intended for human or veterinary use.
                  </p>
                  <p className="mt-2">
                    These products are not intended to diagnose, treat, cure, or prevent any disease.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
