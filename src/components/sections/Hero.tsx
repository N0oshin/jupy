import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { BENEFITS } from '../../lib/content'
import CtaLink from '../ui/CtaLink'

/** Two lines: the second is set in italic accent, like an editorial sub-line. */
const HEADLINE: { words: string[]; italic?: boolean }[] = [
  { words: ['Research-grade'] },
  { words: ['peptides,'] },
  { words: ['verified', 'in', 'every', 'pen.'], italic: true },
]

// Kept in sync with the <link rel="preload"> in index.html — the two must resolve
// to the same file or the preload is wasted and fetched twice.
const HERO_IMG = '/images/ecom/hero-trio-pens.webp'

/**
 * Organic left edge for the photo. Defined as an SVG <clipPath> in
 * objectBoundingBox units (0–1) so it scales with the container — CSS
 * `clip-path: path()` only takes pixel units, which does not scale.
 * Starts ~30% in at the top, bows out to the left, tucks back in and
 * finishes at the bottom-left: the "curved cut" of the reference.
 */
const CURVE_D = 'M0.30,0 C0.10,0.12 0.00,0.36 0.14,0.58 C0.26,0.76 0.10,0.92 0.22,1 L1,1 L1,0 Z'
const CURVE_ID = 'hero-curve-clip'

/** Short captions for the standards bar — the full copy lives in the Benefits section. */
const STANDARD_SUB: Record<(typeof BENEFITS)[number]['k'], string> = {
  '01': 'HPLC on every batch',
  '02': 'Third-party lab confirmed',
  '03': 'COA + MSDS per lot',
  '04': 'Sealed, stability-grade',
}

const ICONS: Record<(typeof BENEFITS)[number]['k'], ReactNode> = {
  '01': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  '02': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 3v6L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" />
      <path d="M7.5 15h9" />
    </svg>
  ),
  '03': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M10 13h6M10 17h6" />
    </svg>
  ),
  '04': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </svg>
  ),
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])

  useGSAP(
    () => {
      if (reduced) return
      // Starts as the preloader curtain lifts.
      const tl = gsap.timeline({ delay: 0.65, defaults: { ease: 'power4.out' } })
      tl.from('.hero-top', { y: 18, opacity: 0, duration: 0.8 })
        .from(
          '.hero-word',
          { yPercent: 120, opacity: 0, filter: 'blur(14px)', rotateX: -40, duration: 1.2, stagger: 0.12 },
          '-=0.6',
        )
        .from('.hero-sub', { y: 16, opacity: 0, duration: 0.7 }, '-=0.6')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.5')
        .from('.hero-photo', { x: 60, opacity: 0, duration: 1.3, ease: 'power3.out' }, 0.1)
        .from('.hero-badge', { y: 14, opacity: 0, duration: 0.6 }, '-=0.5')
        .from('.hero-standard', { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.6')
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section ref={ref} id="top" className="relative w-full overflow-hidden bg-bg">
      <motion.div style={reduced ? undefined : { opacity: fade }} className="relative">
        {/* ── Headline + photo ── */}
        <div className="relative pt-28 sm:pt-32 lg:min-h-[88svh]">
          {/* Photo: curved left edge, bleeds to the right edge on desktop. */}
          <div className="hero-photo relative ml-auto h-[64vw] max-h-[30rem] w-[92%] sm:w-[80%] lg:absolute lg:bottom-0 lg:right-0 lg:top-0 lg:h-auto lg:max-h-none lg:w-[55%]">
            <svg aria-hidden className="absolute h-0 w-0">
              <defs>
                <clipPath id={CURVE_ID} clipPathUnits="objectBoundingBox">
                  <path d={CURVE_D} />
                </clipPath>
              </defs>
            </svg>
            <div
              className="relative h-full w-full overflow-hidden"
              style={{ clipPath: `url(#${CURVE_ID})`, WebkitClipPath: `url(#${CURVE_ID})` }}
            >
              {/* LCP element: preloaded in index.html and fetched at high priority. */}
              <motion.img
                src={HERO_IMG}
                alt="Three women in ivory dresses on a cream sofa, each holding an Alluvi peptide pen"
                fetchPriority="high"
                decoding="async"
                style={reduced ? undefined : { y: imgY }}
                className="absolute inset-0 h-[115%] w-full object-cover object-[62%_50%] lg:object-[70%_50%]"
              />
              {/* Soft fade on the curved edge so the cut reads as a shape, not a hard crop. */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg/30 via-transparent to-transparent" />
              {/* The photo runs up under the fixed navbar on desktop; this band
                  blurs and lightens that strip so the nav links stay legible. */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 hidden h-20 bg-bg/25 backdrop-blur-sm lg:block"
                style={{
                  maskImage: 'linear-gradient(to bottom, #000 55%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to bottom, #000 55%, transparent)',
                }}
              />
            </div>
            
          </div>

          {/* Headline on the plain background. */}
          <div className="container-x relative z-10 mt-8 lg:mt-0 lg:flex lg:min-h-[88svh] lg:items-center lg:pb-36 lg:pt-12">
            <div className="max-w-[40rem] lg:max-w-[36rem]">
              <p className="hero-top flex items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-accent-dark">
                Research. Verify. Deliver.
               
              </p>

              <h1 className="mt-4 font-bodoni text-[clamp(2.2rem,1.1rem+3.4vw,3.7rem)] font-normal leading-[1.06] tracking-[-0.02em] text-ink">
                {HEADLINE.map((line) => (
                  <span
                    key={line.words.join(' ')}
                    className={`block lg:whitespace-nowrap ${line.italic ? 'italic text-accent-dark' : ''}`}
                  >
                    {line.words.map((w) => (
                      <span key={w} className="mr-[0.22em] inline-block overflow-hidden align-bottom">
                        <span className="hero-word inline-block pb-[0.08em]">{w}</span>
                      </span>
                    ))}
                  </span>
                ))}
              </h1>

              <p className="hero-sub mt-5 max-w-md text-[0.95rem] leading-relaxed text-muted">
                Reference-grade compounds in pre-filled pens, each batch characterised by HPLC and
                documented to the lot before it reaches your bench.
              </p>

              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
                <CtaLink to="/products" variant="solid" className="hero-cta !px-6 !py-3 !text-xs" arrow>
                  Explore Products
                </CtaLink>
                <CtaLink to="#about" variant="outline" className="hero-cta !px-6 !py-3 !text-xs">
                  Our Standards
                </CtaLink>
              </div>
            </div>
          </div>
        </div>

        {/* ── Standards bar: replaces the search form in the reference ── */}
        <div className="container-x relative z-20 pb-10 pt-8 lg:-mt-28 lg:pt-0">
          <ul
            aria-label="The Research Standard"
            className="grid gap-y-1 rounded-[var(--radius-xl2)] bg-bg px-2 py-2 shadow-[0_24px_60px_-28px_rgba(42,15,18,0.35)] ring-1 ring-line/60 sm:grid-cols-2 lg:grid-cols-4 lg:rounded-full lg:px-3"
          >
            {BENEFITS.map((b, i) => (
              <li
                key={b.k}
                className={`hero-standard relative flex items-center gap-4 px-4 py-4 lg:px-6 ${
                  i > 0 ? 'lg:before:absolute lg:before:left-0 lg:before:top-1/2 lg:before:h-9 lg:before:w-px lg:before:-translate-y-1/2 lg:before:bg-line' : ''
                }`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-dark/10 text-accent-dark">
                  <span className="h-5 w-5">{ICONS[b.k]}</span>
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[0.9rem] font-medium leading-tight text-ink">{b.t}</span>
                  <span className="mt-0.5 block truncate text-[0.72rem] text-muted">{STANDARD_SUB[b.k]}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  )
}
