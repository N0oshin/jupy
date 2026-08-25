import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import Heading from '../components/ui/Heading'
import ProductCard from '../components/ui/ProductCard'
import { PRODUCTS, BENEFITS } from '../lib/content'
import { useSeo } from '../lib/useSeo'

export default function Shop() {
  useSeo({
    title: 'Shop — Jupyter Labs',
    description:
      'Browse the full Jupyter Labs catalogue — HPLC-verified research peptides, each batch documented and traceable to the lot.',
    path: '/products',
  })

  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 bg-bg pt-28 lg:pt-32">
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
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} />
            ))}
          </div>
        </div>

        {/* Compliance / trust strip */}
        <div className="border-t border-line bg-section">
          <h2 className="sr-only">Our quality standards</h2>
          <div className="container-x grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.k}>
                <p className="text-[0.65rem] uppercase tracking-[0.28em] text-accent-dark">{b.k}</p>
                <h3 className="mt-2 font-display text-lg text-ink">{b.t}</h3>
                <p className="mt-1.5 text-sm leading-[1.5] text-muted">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
