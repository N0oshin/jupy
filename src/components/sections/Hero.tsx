import { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'
import CtaLink from '../ui/CtaLink'
const HEADLINE = [
  ['Research-grade', 'peptides,'],
  ['verified', 'in', 'every', 'pen.'],
]

// Kept in sync with the <link rel="preload"> in index.html — the two must resolve
// to the same file or the preload is wasted and fetched twice.
const HERO_IMG = '/images/ecom/hero-trio-pens.webp'

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const blurPx = useTransform(scrollYProgress, [0, 0.6], [0, 12], { clamp: true })
  const imgFilter = useMotionTemplate`blur(${blurPx}px)`

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
        // CTAs settle in just behind the last headline word.
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.5')
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section ref={ref} id="top" className="relative min-h-[100svh] w-full overflow-hidden bg-bg">
      {/* Full-bleed background image — blurs as you scroll.
          This is the LCP element: it is preloaded in index.html and fetched at
          high priority. object-cover fills the whole viewport edge to edge. */}
      <motion.img
        src={HERO_IMG}
        alt="Three women in ivory dresses on a cream sofa, each holding an Alluvi peptide pen"
        fetchPriority="high"
        decoding="async"
        style={reduced ? undefined : { filter: imgFilter }}
        className="absolute inset-0 h-full w-full object-cover object-[62%_50%] lg:object-[100%_50%]"
      />

      {/* Light scrim for headline legibility: left-to-right on desktop, bottom-up on mobile */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/45 via-bg/10 to-transparent lg:bg-gradient-to-r lg:from-bg/35 lg:via-bg/10 lg:to-transparent" />

      <motion.div
        style={reduced ? undefined : { opacity: fade }}
        className="container-x relative flex min-h-[100svh] flex-col pb-14 pt-28 sm:pt-32 lg:pb-20"
      >
      
        {/* Headline block — left on desktop, bottom on mobile */}
        <div className="mt-auto lg:my-auto lg:max-w-[44rem]">
          <h1 className="font-bodoni text-[clamp(1.6rem,0.8rem+3vw,3rem)] font-light leading-[1.15] text-ink">
            {HEADLINE.map((line) => (
              <span key={line.join(' ')} className="block whitespace-nowrap">
                {line.map((w) => (
                  <span key={w} className="mr-[0.22em] inline-block overflow-hidden align-bottom">
                    <span className="hero-word inline-block">{w}</span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
            <CtaLink to="/products" variant="solid" className="hero-cta !px-4 !py-2 !text-xs">
              Explore More
            </CtaLink>
            <CtaLink to="#about" variant="outline" className="hero-cta !px-4 !py-2 !text-xs">
              Learn More
            </CtaLink>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
