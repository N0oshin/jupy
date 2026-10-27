import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import Heading from '../components/ui/Heading'
import ProductCard from '../components/ui/ProductCard'
import Reveal from '../components/ui/Reveal'
import { BENEFITS, BOX_ART, CATEGORIES, SHOP_ORDER, findCategory, productsInCategory, type Category } from '../lib/content'
import { responsive } from '../lib/responsiveImage'
import { useSeo } from '../lib/useSeo'

export default function Shop() {
  // /products?category=<id> narrows the grid; an unknown or missing id shows
  // everything. The chips below are plain links so the filter is shareable
  // and the footer / homepage tabs can deep-link into it.
  const [params] = useSearchParams()
  const category = findCategory(params.get('category'))
  const active = category && !category.all ? category : undefined
  const products = productsInCategory(active?.id ?? 'all')

  // Start at the top whenever the shop opens or the category changes, so a
  // footer link clicked at the bottom of a page does not land mid-grid.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [active?.id])
  // Compounds we photograph but do not sell yet (BOX_ART entries without a
  // catalogue product). They appear as "coming soon" tiles, so a category
  // like "New in" is never an empty grid.
  const upcoming = Object.entries(BOX_ART)
    .filter(([id, b]) => b.product === null && (!active || active.products.includes(id)))
    .map(([id, b]) => ({ id, ...(b as Extract<(typeof BOX_ART)[keyof typeof BOX_ART], { product: null }>) }))
  // One grid, live and upcoming interleaved in the merchandised SHOP_ORDER.
  const rank = (id: string) => {
    const i = SHOP_ORDER.indexOf(id)
    return i === -1 ? SHOP_ORDER.length : i
  }
  const tiles = [
    ...products.map((p) => ({ kind: 'live' as const, id: p.id, p })),
    ...upcoming.map((u) => ({ kind: 'soon' as const, id: u.id, u })),
  ].sort((a, b) => rank(a.id) - rank(b.id))

  useSeo({
    title: active ? `${active.label} Peptides — Jupyter Labs` : 'Shop — Jupyter Labs',
    description: active
      ? `${active.label} research peptides from Jupyter Labs — HPLC-verified, each batch documented and traceable to the lot.`
      : 'Browse the full Jupyter Labs catalogue — HPLC-verified research peptides, each batch documented and traceable to the lot.',
    path: active ? `/products?category=${active.id}` : '/products',
  })

  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 bg-bg pt-28 lg:pt-32">
        <div
          className="
            container-x pb-10
            [&_h1]:!text-3xl md:[&_h1]:!text-4xl lg:[&_h1]:!text-5xl
            [&_p]:!text-sm md:[&_p]:!text-base
            [&_p]:!leading-relaxed
          "
        >
          <Heading
            as="h1"
            eyebrow="Full Catalogue"
            title={'Every compound.\nOne standard.'}
            intro="HPLC-verified research peptides, each batch independently tested and documented to the lot. For laboratory R&D use only."
          />
        </div>



        <div className="container-x pb-16">
          {/* The product cards are H3s. Without a section H2 the document jumps
              H1 → H3, which screen-reader users navigating by heading level
              experience as a missing level. The design has no visible subtitle
              here, so the heading is present but not painted. */}
          <h2 className="sr-only">Product catalogue</h2>

          {/* Category filter */}
          <nav aria-label="Product categories" className="flex flex-wrap gap-2">
            {(CATEGORIES as readonly Category[]).map((c) => {
              const on = c.all ? !active : active?.id === c.id
              return (
                <Link
                  key={c.id}
                  to={c.all ? '/products' : `/products?category=${c.id}`}
                  aria-current={on ? 'page' : undefined}
                  className={`rounded-full border px-4 py-1.5 font-sans text-[0.68rem] font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${
                    on
                      ? 'border-ink bg-ink text-bg'
                      : 'border-line bg-transparent text-muted hover:border-ink hover:text-ink'
                  }`}
                >
                  {c.label}
                </Link>
              )
            })}
          </nav>

          {tiles.length ? (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {tiles.map((t, i) =>
                t.kind === 'live' ? (
                  <ProductCard key={t.id} p={t.p} i={i} />
                ) : (
                  <Reveal key={t.id} delay={i * 0.08} className="h-full">
                    <article
                      aria-label={`${t.u.name} — coming soon`}
                      className="mx-auto flex h-full w-[95%] flex-col overflow-hidden rounded-[1.3rem] bg-white"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-bg">
                        <img
                          src={t.u.photo}
                          {...responsive(t.u.photo, '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw')}
                          alt={t.u.name}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 font-sans text-[0.6rem] font-medium uppercase tracking-[0.18em] text-bg">
                          Coming soon
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
                        <h3 className="font-display text-base font-semibold leading-[1.2] text-ink">{t.u.name}</h3>
                        <p className="mt-0.5 line-clamp-1 text-[0.95rem] leading-[1.7] text-muted md:text-base">
                          {t.u.tagline.split(' · ')[0]}
                        </p>
                        <p className="mt-auto pt-3 font-sans text-[0.68rem] uppercase tracking-[0.14em] text-muted">
                          Clearing independent testing
                        </p>
                      </div>
                    </article>
                  </Reveal>
                ),
              )}
            </div>
          ) : (
            <p className="mt-10 max-w-md text-muted">
              Nothing in {active?.label ?? 'this category'} yet. New compounds are added as they clear independent
              testing —{' '}
              <Link to="/products" className="text-accent-dark underline underline-offset-4">
                browse all products
              </Link>
              .
            </p>
          )}
        </div>

        {/* Compliance / trust strip */}
        <div>
          <h2 className="sr-only">Our quality standards</h2>
          <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {BENEFITS.map((b, i) => (
              <div key={b.t} className="mx-auto flex max-w-[16rem] flex-col items-center text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[#efe6dc] text-[#4a2c1a]">
                  <StandardIcon index={i} />
                </span>
                <h3 className="mt-6 font-sans text-sm font-normal uppercase tracking-[0.22em] text-ink">{b.t}</h3>
                <p className="mt-3 text-sm font-light leading-[1.65] text-muted">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

/** Thin-line sticker icons for the quality standards, one per benefit in order. */
function StandardIcon({ index }: { index: number }) {
  const common = {
    width: 30,
    height: 30,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.1,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (index) {
    case 0: // flask — purity
      return (
        <svg {...common}>
          <path d="M19 7h10M21 7v11L11 37a3 3 0 0 0 2.7 4.3h20.6A3 3 0 0 0 37 37L27 18V7" />
          <path d="M15.5 30h17" />
          <circle cx="22" cy="35" r="1" />
          <circle cx="27" cy="33" r="1.4" />
        </svg>
      )
    case 1: // magnifier over check — independent testing
      return (
        <svg {...common}>
          <circle cx="21" cy="21" r="12" />
          <path d="M30 30l11 11" />
          <path d="M15.5 21.5l4 4 7-8" />
        </svg>
      )
    case 2: // document — documentation
      return (
        <svg {...common}>
          <path d="M12 6h17l8 8v28H12z" />
          <path d="M29 6v8h8" />
          <path d="M18 22h13M18 28h13M18 34h8" />
        </svg>
      )
    default: // sealed box — stability-grade supply
      return (
        <svg {...common}>
          <path d="M24 5l16 8.5v21L24 43 8 34.5v-21z" />
          <path d="M8 13.5L24 22l16-8.5M24 22v21" />
          <path d="M16 9.5l16 8.5" />
        </svg>
      )
  }
}
