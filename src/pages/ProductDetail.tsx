import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import ProductCard from '../components/ui/ProductCard'
import { PRODUCTS } from '../lib/content'
import { useCart } from '../lib/useCart'
import { formatPrice } from '../lib/format'
import { responsive } from '../lib/responsiveImage'
import { useSeo, SITE_URL } from '../lib/useSeo'

const SECTIONS = ['Description', 'Package Contents', 'Storage Logic'] as const
type Section = (typeof SECTIONS)[number]

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { add } = useCart()
  const navigate = useNavigate()

  const product = useMemo(() => PRODUCTS.find((p) => p.slug === slug), [slug])
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)
  const [open, setOpen] = useState<Section[]>(['Description'])
  const [coaOpen, setCoaOpen] = useState(false)
  const [introOpen, setIntroOpen] = useState(true)

  // Reset per-product UI state when the route switches to another product.
  // Done during render (React's "adjust state on prop change" pattern).
  const [lastSlug, setLastSlug] = useState(slug)
  if (lastSlug !== slug) {
    setLastSlug(slug)
    setActive(0)
    setQty(1)
    setOpen(['Description'])
    setCoaOpen(false)
    setIntroOpen(true)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    if (!coaOpen && !introOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (coaOpen) setCoaOpen(false)
      else if (introOpen) setIntroOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [coaOpen, introOpen])

  useSeo(
    product
      ? {
          // Per-product title/description from the SEO sheet (content.ts →
          // product.seo). Falls back to the previous generated values for any
          // product that has no sheet entry, so adding a product without SEO
          // copy still produces sane metadata.
          title: product.seo?.title ?? `${product.name} — ${product.category} | Jupyter Labs`,
          description: product.seo?.description ?? product.longDesc,
          path: `/products/${product.slug}`,
          image: SITE_URL + product.image,
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              image: SITE_URL + product.image,
              description: product.longDesc,
              category: product.category,
              brand: { '@type': 'Brand', name: 'Jupyter Labs' },
              offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: product.currency,
                availability: 'https://schema.org/InStock',
                url: `${SITE_URL}/products/${product.slug}`,
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
                { '@type': 'ListItem', position: 2, name: 'Shop', item: SITE_URL + '/#products' },
                { '@type': 'ListItem', position: 3, name: product.name },
              ],
            },
          ],
        }
      : { title: 'Product not found — Jupyter Labs', path: '/products', noindex: true },
  )

  if (!product) {
    return (
      <>
        <Navbar />
        <main id="main-content" className="container-x flex min-h-[70vh] flex-col items-center justify-center text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.32em] text-muted">404</p>
          <h1 className="mt-3 font-display text-3xl text-ink">Product not found</h1>
          <Link to="/#products" className="mt-8 rounded-full bg-accent-dark px-6 py-3 text-sm text-bg">
            Back to Shop
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4)

  function addToCart() {
    add(product!.id, qty)
  }

  function buyNow() {
    add(product!.id, qty)
    navigate('/checkout')
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 bg-bg pb-20 pt-28 lg:pb-28 lg:pt-32">
        <div className="container-x">
          <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted">
            <Link to="/" className="hover:text-ink">Home</Link>
            <span>/</span>
            <Link to="/#products" className="hover:text-ink">Shop</Link>
            <span>/</span>
            <span className="text-ink">{product.name}</span>
          </nav>

          <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            {/* Sticky Gallery */}
            <div className="mx-auto flex w-full max-w-[30rem] flex-col gap-3 lg:sticky lg:top-28 lg:self-start">
              <div className="relative aspect-[1/1] w-full overflow-hidden rounded-2xl bg-section">
                <img
                  key={product.gallery[active]}
                  src={product.gallery[active]}
                  {...responsive(product.gallery[active], '(min-width: 1024px) 30rem, 100vw')}
                  alt={`${product.name} — view ${active + 1}`}
                  fetchPriority={active === 0 ? 'high' : 'auto'}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
                />
              </div>
              {/* Thumbnails: the two lifestyle shots plus the studio set — six per
                  product, so the row is sized by count rather than a fixed 4-up. */}
              <div
                className="grid gap-2 sm:gap-3"
                style={{ gridTemplateColumns: `repeat(${product.gallery.length}, minmax(0, 1fr))` }}
              >
                {product.gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={active === i}
                    className={`relative aspect-square overflow-hidden rounded-xl bg-section transition-all ${
                      active === i ? 'ring-2 ring-[#4a2c1a] ring-offset-2 ring-offset-bg' : 'opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={src}
                      {...responsive(src, '6rem')}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Scrolling info column */}
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <h1 className="font-display text-2xl tracking-[-0.02em] text-ink lg:text-3xl">{product.name}</h1>
                <p className="shrink-0 font-display text-2xl text-ink lg:text-3xl">{formatPrice(product.price, product.currency)}</p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted">Qty</span>
                <div className="flex items-center rounded-full border border-line">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-9 w-9 place-items-center text-ink hover:text-accent-dark"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="grid h-9 w-9 place-items-center text-ink hover:text-accent-dark"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={addToCart}
                  className="min-h-12 whitespace-nowrap rounded-md bg-[#4a2c1a] px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#5d3a24]"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={buyNow}
                  className="min-h-12 whitespace-nowrap rounded-md border border-[#4a2c1a] bg-transparent px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#4a2c1a] transition-colors hover:bg-[#4a2c1a] hover:text-white"
                >
                  Buy Now
                </button>
              </div>

              {/* Accordion: Description / Package Contents / Storage Logic */}
              <div className="mt-8 border-y border-line">
                {SECTIONS.map((name, idx) => {
                  const isOpen = open.includes(name)
                  return (
                    <div key={name} className={idx ? 'border-t border-line' : ''}>
                      <h2>
                        <button
                          type="button"
                          onClick={() => setOpen((o) => (isOpen ? o.filter((n) => n !== name) : [...o, name]))}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between py-5 text-left text-sm text-ink"
                        >
                          {name}
                          <span aria-hidden className="text-lg font-light leading-none text-muted">{isOpen ? '−' : '+'}</span>
                        </button>
                      </h2>
                      {isOpen && (
                        <div className="pb-5 text-sm leading-relaxed text-ink">
                          {name === 'Description' && <p className="text-muted">{product.longDesc}</p>}
                          {name === 'Package Contents' && product.included && (
                            <>
                              <p className="text-xs text-muted">Each {product.name} research kit includes:</p>
                              <ul className="mt-3 space-y-2">
                                {product.included.map((item) => (
                                  <li key={item} className="flex items-start gap-2">
                                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-dark" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          {name === 'Storage Logic' && (
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-dark" />
                                <span>Store refrigerated (2–8°C). Do not freeze.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-dark" />
                                <span>Supplied in fixed-volume sealed format for laboratory analysis.</span>
                              </li>
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* View Janoshik Analytical Report */}
              {product.coa && product.coa.image && (
                <button
                  type="button"
                  onClick={() => setCoaOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-dark hover:text-accent"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  View Janoshik Analytical Report
                </button>
              )}

              {/* Compound analysis card */}
              {product.coa && (
                <div className="mt-6 rounded-[var(--radius-xl2)] border border-line bg-card p-6">
                  <p className="text-center text-[0.65rem] uppercase tracking-[0.28em] text-accent-dark">
                    Janoshik Third-Party Lab Analysis
                  </p>
                  <p className="mt-1 text-center text-[0.65rem] text-muted">
                    Independently tested and verified by Janoshik Analytical
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-4 border-y border-line py-4 text-center">
                    <div>
                      <p className="text-[0.55rem] uppercase tracking-[0.22em] text-muted">Assay ID</p>
                      <p className="mt-1 text-sm font-medium text-ink">{product.coa.taskId}</p>
                    </div>
                    <div>
                      <p className="text-[0.55rem] uppercase tracking-[0.22em] text-muted">Fill Volume</p>
                      <p className="mt-1 text-sm font-medium text-ink">{product.coa.fillVolume}</p>
                    </div>
                    <div>
                      <p className="text-[0.55rem] uppercase tracking-[0.22em] text-muted">Purity</p>
                      <p className="mt-1 text-sm font-medium text-accent-dark">{product.coa.purity}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-[0.55rem] uppercase tracking-[0.22em] text-muted">Compound</p>
                      <p className="mt-1 text-sm text-ink">{product.coa.compound}</p>
                    </div>
                    <div>
                      <p className="text-[0.55rem] uppercase tracking-[0.22em] text-muted">Sequence</p>
                      <p className="mt-1 text-sm text-ink">{product.coa.sequence}</p>
                    </div>
                    <div>
                      <p className="text-[0.55rem] uppercase tracking-[0.22em] text-muted">Total Content</p>
                      <p className="mt-1 text-sm text-ink">{product.coa.totalContent}</p>
                    </div>
                  </div>

                  <p className="mt-5 text-center text-[0.65rem] leading-relaxed text-muted">
                    Concentration is measured per mL; combined content reflects the total quantity across the dispenser barrel
                    ({product.coa.concentrationLabel}).
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Continue Your Research */}
          <section className="mt-16 border-t border-line pt-12 lg:mt-20">
            <div className="flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-end">
              <div>
                <h2 className="font-display text-2xl tracking-[-0.02em] text-ink lg:text-3xl">Continue Your Research</h2>
                <p className="mt-2 text-sm text-muted">Handpicked research kits that pair well with {product.name}.</p>
              </div>
              <Link to="/#products" className="text-sm text-accent-dark hover:text-accent">View all →</Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} p={p} i={i} />
              ))}
            </div>
          </section>

          {/* Product-footer compliance band */}
          <section className="mt-14 rounded-[var(--radius-xl2)] border border-line bg-section p-6 text-center lg:p-8">
            <p className="text-[0.6rem] uppercase tracking-[0.28em] text-accent-dark">Compliance Notice</p>
            <p className="mx-auto mt-3 max-w-3xl text-xs leading-relaxed text-muted">
              <span className="font-semibold text-ink">FOR RESEARCH PURPOSES ONLY.</span> Not intended for human or veterinary
              use. Not intended to diagnose, treat, cure, or prevent any disease. Products are supplied strictly for laboratory
              and analytical research conducted by qualified professionals. Nothing on this page constitutes medical, therapeutic
              or usage guidance.
            </p>
          </section>
        </div>
      </main>

      {/* Intro / Auto-open Janoshik Lab Analysis Modal */}
      {introOpen && product.coa && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Janoshik Third-Party Lab Analysis — ${product.name}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-md"
          onClick={() => setIntroOpen(false)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-card p-8 shadow-[0_40px_120px_-30px_rgba(15,32,42,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIntroOpen(false)}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-line bg-section text-ink transition-colors hover:bg-bg-deep"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            {/* Beaker icon */}
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#5c3a21] text-bg">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 3h6" />
                <path d="M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" />
                <path d="M8 15h8" />
              </svg>
            </div>

            <h2 className="mt-5 text-center font-display text-xl tracking-tight text-ink">
              Janoshik Third-Party Lab Analysis
            </h2>
            <p className="mt-2 text-center text-sm text-muted">
              Independently tested and verified by Janoshik Analytical.
            </p>

            {/* Stat cards */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-line bg-section px-3 py-4 text-center">
                <p className="text-[0.55rem] uppercase tracking-[0.18em] text-muted">Batch Number</p>
                <p className="mt-2 text-sm font-semibold text-ink">{product.coa.batch}</p>
              </div>
              <div className="rounded-2xl border border-line bg-section px-3 py-4 text-center">
                <p className="text-[0.55rem] uppercase tracking-[0.18em] text-muted">Fill Volume</p>
                <p className="mt-2 text-sm font-semibold text-ink">{product.coa.fillVolume}</p>
              </div>
              <div className="rounded-2xl border border-line bg-section px-3 py-4 text-center">
                <p className="text-[0.55rem] uppercase tracking-[0.18em] text-muted">Purity</p>
                <p className="mt-2 text-sm font-semibold text-[#5c3a21]">{product.coa.purity}</p>
              </div>
            </div>

            {/* Results table */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-line">
              <div className="grid grid-cols-3 gap-3 bg-section px-4 py-3">
                <p className="text-[0.55rem] uppercase tracking-[0.18em] text-muted">Compound</p>
                <p className="text-center text-[0.55rem] uppercase tracking-[0.18em] text-muted">Concentration</p>
                <p className="text-right text-[0.55rem] uppercase tracking-[0.18em] text-muted">Verified Content</p>
              </div>
              <div className="grid grid-cols-3 items-center gap-3 px-4 py-4">
                <p className="text-sm font-semibold text-ink">{product.coa.compound}</p>
                <p className="text-center text-sm text-ink">{product.coa.concentrationLabel}</p>
                <p className="text-right text-sm font-semibold text-ink">{product.coa.totalContent}</p>
              </div>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-muted">
              Concentration is measured per mL; verified content reflects the total assayed mass across the stated fill volume.
            </p>

            {product.coa.image ? (
              <button
                type="button"
                onClick={() => {
                  setIntroOpen(false)
                  setCoaOpen(true)
                }}
                className="mt-6 flex w-full items-center justify-center rounded-full bg-[#5c3a21] px-6 py-3.5 text-sm font-medium text-bg transition-all hover:bg-[#7a4f2e] hover:shadow-[0_20px_40px_-20px_rgba(92,58,33,0.6)]"
              >
                View Full Janoshik Report
              </button>
            ) : (
              <p className="mt-6 rounded-2xl border border-line bg-section px-4 py-3 text-center text-xs leading-relaxed text-muted">
                A batch-specific Janoshik Certificate of Analysis is included with every order.
              </p>
            )}
          </div>
        </div>
      )}

      {/* COA Modal */}
      {coaOpen && product.coa && product.coa.image && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Janoshik Certificate of Analysis — ${product.name}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-md"
          onClick={() => setCoaOpen(false)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-bg shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.28em] text-accent-dark">Certificate of Analysis</p>
                <p className="mt-0.5 font-display text-lg text-ink">{product.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={product.coa.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden rounded-full bg-accent-dark px-4 py-2 text-xs font-medium text-bg hover:bg-accent sm:inline-flex"
                >
                  Verify on Janoshik →
                </a>
                <button
                  type="button"
                  onClick={() => setCoaOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink hover:bg-section"
                  aria-label="Close certificate"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-section p-6">
              <img
                src={product.coa.image}
                alt={`Janoshik Certificate of Analysis — ${product.name}`}
                className="mx-auto block w-full max-w-2xl rounded-[var(--radius-xl2)] bg-bg shadow-[0_20px_60px_-30px_rgba(121,13,22,0.35)]"
              />

              {'sampleImages' in product.coa &&
                Array.isArray(product.coa.sampleImages) &&
                product.coa.sampleImages.length > 0 && (
                  <div className="mx-auto mt-8 w-full max-w-2xl">
                    <p className="text-center text-[0.6rem] uppercase tracking-[0.28em] text-muted">
                      Sample as received by Janoshik · Batch {product.coa.batch}
                    </p>
                    <div className="mt-4 flex flex-col gap-6">
                      {product.coa.sampleImages.map((src, i) => (
                        <a
                          key={src}
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-[var(--radius-xl2)] bg-bg shadow-[0_20px_60px_-30px_rgba(121,13,22,0.35)] transition-transform hover:-translate-y-0.5"
                          aria-label={`Open Janoshik sample photo ${i + 1}`}
                        >
                          <img
                            src={src}
                            alt={`Janoshik sample photo ${i + 1} — ${product.name}`}
                            className="mx-auto block w-full max-w-2xl"
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-3 text-xs text-muted">
              <span>
                Batch {product.coa.batch} · Task {product.coa.taskId} · {product.coa.testDate}
              </span>
              <a
                href={product.coa.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-dark hover:text-accent sm:hidden"
              >
                Verify →
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
