import { Link } from 'react-router-dom'
import Heading from '../ui/Heading'
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
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <Heading
            eyebrow="Featured Compounds"
            title={'Six peptides.\nOne standard.'}
            intro="A focused catalogue of research-grade peptides — each one HPLC-verified, traceable to its lot, and sealed under stability-grade conditions."
          />
          {hasMore && (
            <Magnetic>
              <Link
                to="/shop"
                className="hidden shrink-0 items-center gap-2 text-sm tracking-wide text-accent-dark md:inline-flex"
              >
                View full catalogue
                <span className="h-px w-8 bg-accent-dark" />
              </Link>
            </Magnetic>
          )}
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-10 flex justify-center md:hidden">
            <Link
              to="/shop"
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
