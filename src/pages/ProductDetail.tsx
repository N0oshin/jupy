import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import { PRODUCTS } from '../lib/content'
import { useCart, formatPrice } from '../lib/CartContext'
import { useSeo, SITE_URL } from '../lib/useSeo'

const TABS = ['Package Contents', 'Storage Logic'] as const
type Tab = (typeof TABS)[number]

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { add } = useCart()

  const product = useMemo(() => PRODUCTS.find((p) => p.slug === slug), [slug])
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<Tab>('Package Contents')
  const [coaOpen, setCoaOpen] = useState(false)
  const [introOpen, setIntroOpen] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    setActive(0)
    setQty(1)
    setTab('Package Contents')
    setCoaOpen(false)
    setIntroOpen(true)
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

  const related = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3)

  function addToCart() {
    add(product!.id, qty)
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 bg-bg pt-28 lg:pt-32">
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
            <div className="flex flex-col gap-0 lg:sticky lg:top-28 lg:self-start">
              <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-xl2)]">
                <img
                  src={product.gallery[active]}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-contain transition-opacity duration-500"
                />
                <span className="absolute left-4 top-4 rounded-full bg-bg/95 px-3 py-1 text-[0.6rem] uppercase tracking-[0.22em] text-ink backdrop-blur-md">
                  {product.category}
                </span>
              </div>
              <div className="-mt-10 flex flex-wrap justify-center gap-2 sm:-mt-20 sm:gap-3">
                {product.gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl transition-all sm:h-24 sm:w-24 lg:h-28 lg:w-28 ${
                      active === i ? 'ring-2 ring-accent-dark ring-offset-2 ring-offset-bg' : 'opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={src} alt="" className="absolute inset-0 h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            {/* Scrolling info column */}
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-accent-dark">Compound Analysis</p>
              {/* H1 text comes from the SEO sheet where one is defined; classes
                  are unchanged, so the existing size/weight/tracking and
                  responsive behaviour are untouched and longer strings simply
                  wrap. Falls back to the product name when no sheet H1 exists. */}
              <h1 className="mt-3 font-display text-4xl tracking-[-0.02em] text-ink lg:text-5xl">{product.seo?.h1 ?? product.name}</h1>
              <p className="mt-4 font-display text-3xl text-ink">{formatPrice(product.price, product.currency)}</p>

              <p className="mt-6 text-sm leading-relaxed text-muted">{product.longDesc}</p>

              {/* Safety preface */}
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-section px-4 py-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-dark/10 text-accent-dark" aria-hidden>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </span>
                <p className="text-xs leading-relaxed text-ink">
                  <span className="font-medium">For research purposes only.</span> Not intended for human or veterinary use.
                  Not intended to diagnose, treat, cure, or prevent any disease. Supplied strictly for laboratory and analytical
                  research conducted by qualified professionals.
                </p>
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

              {/* Tabs: Package Contents / Storage / Supply Chain */}
              <div className="mt-8">
                <div className="flex flex-wrap gap-1 rounded-full border border-line bg-section p-1">
                  {TABS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em] transition-all ${
                        tab === t ? 'bg-accent-dark text-bg' : 'text-muted hover:text-ink'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="mt-5 min-h-[7rem] text-sm text-ink">
                  {tab === 'Package Contents' && product.included && (
                    <>
                      <p className="text-xs text-muted">Each {product.name} research kit includes:</p>
                      <ul className="mt-3 space-y-2">
                        {product.included.map((item) => (
                          <li key={item} className="flex items-start gap-2 leading-relaxed">
                            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-dark" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {tab === 'Storage Logic' && (
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 leading-relaxed">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-dark" />
                        <span>Store refrigerated (2–8°C). Do not freeze.</span>
                      </li>
                      <li className="flex items-start gap-2 leading-relaxed">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-dark" />
                        <span>Supplied in fixed-volume sealed format for laboratory analysis.</span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-stretch gap-3">
                <div className="flex shrink-0 items-center rounded-full border border-line">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-12 w-12 place-items-center text-ink hover:text-accent-dark"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="grid h-12 w-12 place-items-center text-ink hover:text-accent-dark"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={addToCart}
                  className="min-h-12 flex-1 whitespace-nowrap rounded-full bg-accent-dark px-6 py-3 text-sm font-medium text-bg transition-all hover:bg-accent hover:shadow-[0_20px_40px_-20px_rgba(15,118,110,0.6)]"
                >
                  Add to Cart
                </button>
              </div>

              {/* Required research-only disclaimer, immediately beside the purchase action */}
              <p className="mt-4 rounded-2xl border border-line bg-section px-4 py-3 text-[0.7rem] leading-relaxed text-muted">
                <span className="font-semibold uppercase tracking-[0.14em] text-ink">For research purposes only.</span>{' '}
                Not intended for human or veterinary use. Not intended to diagnose, treat, cure, or prevent any disease.
                Products are supplied strictly for laboratory and analytical research conducted by qualified professionals.
              </p>

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
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-card transition-all hover:-translate-y-1 hover:border-accent-dark/30"
                >
                  <div className="relative aspect-[5/4] overflow-hidden bg-section">
                    <img src={p.image} alt={p.name} className="absolute inset-0 h-full w-full scale-[0.95] object-contain transition-transform duration-700 group-hover:scale-100" />
                  </div>
                  <div className="p-5">
                    <p className="text-[0.6rem] uppercase tracking-[0.22em] text-muted">Compound</p>
                    <h3 className="mt-2 font-display text-lg text-ink">{p.name}</h3>
                    <p className="mt-2 text-sm text-accent-dark">{formatPrice(p.price, p.currency)}</p>
                  </div>
                </Link>
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
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent-dark text-bg">
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
                <p className="mt-2 text-sm font-semibold text-accent-dark">{product.coa.purity}</p>
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
                className="mt-6 flex w-full items-center justify-center rounded-full bg-accent-dark px-6 py-3.5 text-sm font-medium text-bg transition-all hover:bg-accent hover:shadow-[0_20px_40px_-20px_rgba(15,118,110,0.6)]"
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
                className="mx-auto block w-full max-w-2xl rounded-[var(--radius-xl2)] bg-bg shadow-[0_20px_60px_-30px_rgba(15,118,110,0.35)]"
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
                          className="block overflow-hidden rounded-[var(--radius-xl2)] bg-bg shadow-[0_20px_60px_-30px_rgba(15,118,110,0.35)] transition-transform hover:-translate-y-0.5"
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
