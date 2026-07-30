import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Reveal from './Reveal'
import { PRODUCTS } from '../../lib/content'
import { formatPrice } from '../../lib/CartContext'
import { useReducedMotion } from '../../lib/useReducedMotion'

type Product = (typeof PRODUCTS)[number]

/** Editorial product card with a mouse-tilt hover effect — shared by the homepage teaser and the full Shop page. */
export default function ProductCard({ p, i }: { p: Product; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 150, damping: 18 })
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 150, damping: 18 })

  function onMove(e: React.MouseEvent) {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  function reset() {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <Reveal delay={i * 0.08} className="h-full">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={reduced ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-card transition-all duration-500 hover:-translate-y-1 hover:border-accent-dark/30 hover:shadow-[0_40px_80px_-30px_rgba(15,118,110,0.35)]"
      >
        {/* Image hero — fills top */}
        <div className="relative aspect-[5/4] w-full overflow-hidden">
          <img
            src={p.image}
            alt={p.name}
            className="absolute inset-0 h-full w-full scale-[0.95] object-contain"
            style={{ objectPosition: '50% 50%' }}
            loading="lazy"
            decoding="async"
          />

          {/* Top floating chips */}
          <div className="absolute inset-x-4 top-4 z-10 flex items-start justify-between">
            <span className="rounded-full bg-bg/95 px-3 py-1 text-[0.6rem] uppercase tracking-[0.22em] text-ink backdrop-blur-md">
              {p.tagline.split(' · ')[0]}
            </span>
            <span className="rounded-full bg-ink/85 px-3 py-1 font-display text-xs font-medium text-bg backdrop-blur-md">
              {formatPrice(p.price, p.currency)}
            </span>
          </div>

          {/* Bottom purity chip */}
          <span className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-bg/95 px-3 py-1 text-[0.65rem] font-medium text-accent-dark backdrop-blur-md">
            <span
              className="grid h-3.5 w-3.5 place-items-center rounded-full text-bg"
              style={{ background: p.accent }}
            >
              <svg width="8" height="8" viewBox="0 0 14 14" fill="none">
                <path d="M2 7.5L5.5 11L12 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {p.stat}
          </span>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-6">
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-muted">{p.tagline}</p>
          <h3 className="mt-2 font-display text-xl font-medium leading-[1.15] tracking-[-0.02em] text-ink lg:text-2xl">
            {p.name}
          </h3>
          <p className="mt-2 grow text-sm leading-[1.5] text-muted">{p.desc}</p>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <Link
              to={`/products/${p.slug}`}
              className="group/cta inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent-dark"
            >
              Explore In Details
              <span className="transition-transform duration-500 group-hover/cta:translate-x-1">→</span>
            </Link>
            <Link
              to={`/products/${p.slug}`}
              aria-label={`View ${p.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-bg transition-all duration-500 group-hover:bg-accent-dark group-hover:rotate-45"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </motion.div>
    </Reveal>
  )
}
