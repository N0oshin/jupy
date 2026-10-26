import { useEffect, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import { PRODUCTS } from '../lib/content'
import { useCart } from '../lib/useCart'
import { formatPrice } from '../lib/format'
import { useSeo } from '../lib/useSeo'

const BROWN = 'text-[#3b1f14]'

function CircleBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-6 w-6 place-items-center rounded-full border border-[#3b1f14]/40 text-[0.8125rem] leading-none text-[#3b1f14] transition-colors hover:border-[#3b1f14] hover:bg-[#3b1f14] hover:text-bg"
    >
      {children}
    </button>
  )
}

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

  const total = subtotal

  function checkout() {
    navigate('/checkout')
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 bg-bg pt-28 lg:pt-32">
        <div className="container-x pb-16">
          <Link
            to="/#products"
            className={`inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.22em] ${BROWN} hover:text-[#5a3220]`}
          >
            <span aria-hidden>‹</span> Back to store
          </Link>

          {lineItems.length === 0 ? (
            <>
              <h1 className="mt-4 font-display text-4xl tracking-[-0.02em] text-ink lg:text-5xl">Shopping cart</h1>
              <div className="mt-10 flex flex-col items-center justify-center rounded-[var(--radius-xl2)] bg-bg py-14 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#fdfcf8] text-accent-dark">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21 8H6" />
                    <circle cx="9" cy="20" r="1.5" />
                    <circle cx="18" cy="20" r="1.5" />
                  </svg>
                </div>
                <p className="mt-5 font-display text-xl text-ink">No research products yet</p>
                <p className="mt-2 text-[0.8125rem] text-muted">Explore our catalogue and add a compound to get started.</p>
                <Link
                  to="/#products"
                  className="mt-8 rounded-full bg-[#3b1f14] px-6 py-3 text-[0.8125rem] text-bg transition-colors hover:bg-[#5a3220]"
                >
                  Continue shopping
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-0 lg:overflow-hidden lg:rounded-[var(--radius-xl2)]">
              {/* Items */}
              <section className="lg:pr-12">
                <div className="flex items-end justify-between">
                  <h1 className="font-display text-4xl tracking-[-0.02em] text-ink lg:text-5xl">Shopping cart</h1>
                  <p className="pb-2 text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                    {lineItems.length} {lineItems.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <div className="mt-10 hidden grid-cols-[1fr_7rem_6rem_2rem] gap-4 text-[0.65rem] tracking-[0.12em] text-muted sm:grid">
                  <span>Item</span>
                  <span>Quantity</span>
                  <span>Price</span>
                  <span />
                </div>

                <ul className="mt-4 flex flex-col">
                  {lineItems.map(({ product, qty }) => (
                    <li
                      key={product.id}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 py-5 sm:grid-cols-[1fr_7rem_6rem_2rem]"
                    >
                      <div className="col-span-2 flex items-center gap-5 sm:col-span-1 sm:col-start-1 sm:row-start-1">
                        <Link
                          to={`/products/${product.slug}`}
                          className="relative h-20 w-14 shrink-0 overflow-hidden"
                        >
                          <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-contain" />
                        </Link>
                        <div>
                          <Link
                            to={`/products/${product.slug}`}
                            className="block font-display text-lg text-ink transition-colors hover:text-[#3b1f14]"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.22em] text-muted">{product.category}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(product.id)}
                        aria-label={`Remove ${product.name}`}
                        className={`col-start-3 row-start-1 justify-self-end text-2xl leading-none ${BROWN} transition-colors hover:text-accent sm:col-start-4`}
                      >
                        ×
                      </button>

                      <div className="col-span-2 flex items-center gap-2.5 sm:col-span-1 sm:col-start-2 sm:row-start-1">
                        <CircleBtn label="Decrease quantity" onClick={() => setQty(product.id, qty - 1)}>
                          −
                        </CircleBtn>
                        <span className="w-4 text-center text-[0.8125rem] text-ink">{qty}</span>
                        <CircleBtn label="Increase quantity" onClick={() => setQty(product.id, qty + 1)}>
                          +
                        </CircleBtn>
                      </div>

                      <p className="text-[0.8125rem] text-ink sm:col-start-3 sm:row-start-1">{formatPrice(product.price * qty, product.currency)}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-5">
                  <p className="text-[0.7rem] text-muted">For laboratory research use only.</p>
                  <button
                    type="button"
                    onClick={clear}
                    className={`text-[0.65rem] uppercase tracking-[0.2em] ${BROWN} transition-colors hover:text-accent`}
                  >
                    Clear cart
                  </button>
                </div>
              </section>

              {/* Summary */}
              <aside className="flex flex-col rounded-[var(--radius-xl2)] bg-bg p-8 lg:rounded-none">
                <h2 className="font-display text-xl text-ink">Summary</h2>

                <dl className="mt-8 space-y-3 text-[0.8125rem]">
                  <div className="flex justify-between">
                    <dt className="text-muted">Subtotal</dt>
                    <dd className="text-ink">{formatPrice(subtotal)}</dd>
                  </div>
                </dl>

                <div className="mt-auto pt-24">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[0.8125rem] text-ink">Total</span>
                    <span className="font-display text-xl text-ink">{formatPrice(total)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={checkout}
                    className="mt-6 w-full bg-[#3b1f14] py-4 text-[0.65rem] font-medium uppercase tracking-[0.25em] text-bg transition-colors hover:bg-[#5a3220]"
                  >
                    Checkout
                  </button>

                  <div className="mt-6 text-[0.7rem] leading-relaxed text-muted">
                    <p>
                      By proceeding to checkout, you acknowledge that these products are intended solely for laboratory
                      research purposes and are not intended for human or veterinary use.
                    </p>
                    <p className="mt-2">
                      These products are not intended to diagnose, treat, cure, or prevent any disease.
                    </p>
                  </div>
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
