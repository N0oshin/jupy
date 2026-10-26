import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import Stars from './Stars'
import { PRODUCTS } from '../../lib/content'
import { formatPrice } from '../../lib/format'
import { useCart } from '../../lib/useCart'
import { responsive } from '../../lib/responsiveImage'

type Product = (typeof PRODUCTS)[number]

/**
 * Minimal product card — soft rounded photo tile, name, a one-line descriptor and a price
 * with a quick add-to-cart button. Shared by the homepage teaser and the full Shop page.
 * `compact` is the smaller type scale used by the homepage teaser section.
 */
export default function ProductCard({ p, i, compact = false }: { p: Product; i: number; compact?: boolean }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  const href = `/products/${p.slug}`

  function onAdd() {
    add(p.id)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <Reveal delay={i * 0.08} className="h-full">
      <article className="group mx-auto flex h-full w-[95%] flex-col overflow-hidden rounded-[1.3rem] bg-white">
        {/* Photo — fills most of the card */}
        <Link
          to={href}
          aria-label={`View ${p.name}`}
          className="relative block aspect-square w-full overflow-hidden bg-bg outline-none ring-accent-dark/50 focus-visible:ring-2"
        >
          <img
            src={p.image}
            {...responsive(p.image, '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw')}
            alt={p.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.05]"
            loading="lazy"
            decoding="async"
          />
        </Link>

        {/* Details */}
        <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
          <Link to={href} className="outline-none">
            <h3 className={`font-display font-semibold leading-[1.2] text-ink ${compact ? 'text-sm' : 'text-base'}`}>
              {p.name}
            </h3>
          </Link>
          <p className={`mt-0.5 line-clamp-1 text-muted ${compact ? 'text-xs' : 'text-[0.95rem] leading-[1.7] md:text-base'}`}>
            {p.tagline.split(' · ')[0]}
          </p>
          <Stars rating={p.rating} size={compact ? 11 : 13} className="mt-1.5" />

          <div className="mt-auto flex items-center justify-between pt-3">
            <span className={`font-display font-semibold text-ink ${compact ? 'text-base' : 'text-lg'}`}>
              {formatPrice(p.price, p.currency)}
            </span>
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Add ${p.name} to cart`}
              className="grid h-8 w-8 place-items-center rounded-full bg-[#efe6dc] text-[#4a2c1a] transition-all duration-300 hover:bg-[#4a2c1a] hover:text-white active:scale-95"
            >
              {added ? (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 7.5L5.5 11L12 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  )
}
