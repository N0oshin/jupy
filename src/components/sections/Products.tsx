import { Link } from 'react-router-dom'
import Heading from '../ui/Heading'
import Reveal from '../ui/Reveal'
import Magnetic from '../ui/Magnetic'
import ProductCard from '../ui/ProductCard'
import { PRODUCTS } from '../../lib/content'

const INITIAL_COUNT = 3

export default function Products() {
  const visible = PRODUCTS.slice(0, INITIAL_COUNT)
  const hasMore = PRODUCTS.length > INITIAL_COUNT

  return (
    <section id="products" className="section-pad relative bg-section">
      <div className="container-x">
        {/* Eyebrow + title on the left, intro opposite it on the right — the
            same two-column header the About and Why Us sections use, rather than
            the intro stacking under the title. Baseline-aligned via items-end so
            the paragraph sits level with the last line of the heading. */}
        <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Heading
              eyebrow="Featured Compounds"
              title={'Research peptides.\nOne uncompromising standard.'}
            />
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.2}>
              <p className="text-[1.05rem] leading-[1.6] text-muted text-pretty">
                Explore our curated catalogue of research-grade peptides. Every compound is HPLC-verified,
                independently tested, lot-traceable and packaged under stability-grade conditions to support precision
                peptide research and modern laboratory studies.
              </p>
              {hasMore && (
                <Magnetic className="mt-6 inline-block">
                  <Link
                    to="/products"
                    className="hidden items-center gap-2 text-sm tracking-wide text-accent-dark md:inline-flex"
                  >
                    View full catalogue
                    <span className="h-px w-8 bg-accent-dark" />
                  </Link>
                </Magnetic>
              )}
            </Reveal>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-10 flex justify-center md:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full border border-accent-dark px-6 py-3 text-sm tracking-wide text-accent-dark transition-colors hover:bg-accent-dark hover:text-bg"
            >
              View full catalogue
              <span className="transition-transform">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
