import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import Heading from '../components/ui/Heading'
import ProductCard from '../components/ui/ProductCard'
import { BENEFITS, CATEGORIES, findCategory, productsInCategory, type Category } from '../lib/content'
import { useSeo } from '../lib/useSeo'

export default function Shop() {
  // /products?category=<id> narrows the grid; an unknown or missing id shows
  // everything. The chips below are plain links so the filter is shareable
  // and the footer / homepage tabs can deep-link into it.
  const [params] = useSearchParams()
  const category = findCategory(params.get('category'))
  const active = category && !category.all ? category : undefined
  const products = productsInCategory(active?.id ?? 'all')

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
      <main id="main-content" className="relative z-10 bg-[#fffdf8] pt-28 lg:pt-32">
        <div className="container-x pb-10">
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

          {products.length ? (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} p={p} i={i} />
              ))}
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
