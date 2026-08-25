import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import SplitReveal from '../ui/SplitReveal'
import CtaLink from '../ui/CtaLink'
import { useReducedMotion } from '../../lib/useReducedMotion'

const EASE = [0.16, 1, 0.3, 1] as const

const POSTER = '/videos/dna-video-poster.webp'

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [inView, setInView] = useState(false)

  // The video is decoration at the very bottom of the page. Fetching it on load
  // spends the user's bandwidth on something they may never scroll to, so it is
  // only mounted once the section is near the viewport. Users who asked for
  // reduced motion keep the poster and never download it at all.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || reduced) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  return (
    <section ref={sectionRef} id="cta" className="relative overflow-hidden bg-accent-dark text-bg">
      {/* Background video — DNA / peptide loop. Poster paints immediately; the
          video fades in over it once decoded, so there is no empty frame. */}
      <img
        src={POSTER}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {inView && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/dna-video.mp4"
          poster={POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent-dark via-accent-dark/45 to-accent-dark/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent-dark/40 via-transparent to-accent-dark/40" />
      <div className="absolute inset-0 grain opacity-15" />

      {/* Section height */}
      <div className="relative flex min-h-[55vh] items-end pb-14 lg:min-h-[65vh] lg:pb-20">
        <div className="container-x w-full">
          <div className="mx-auto max-w-3xl text-center">
            {/* eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ duration: 0.9, ease: EASE }}
              className="flex items-center justify-center gap-3"
            >
              <span className="relative grid h-2 w-2 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-gold/70" />
                <span className="relative h-2 w-2 rounded-full bg-gold" />
              </span>
              <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gold">Research-Grade Peptides</p>
            </motion.div>

            {/* Headline — line-by-line rise via SplitReveal */}
            <SplitReveal
              as="h2"
              mode="lines"
              stagger={0.18}
              className="mt-6 font-display text-[clamp(2rem,1.15rem+3.5vw,4.1rem)] font-light leading-[1.06] tracking-[-0.025em] text-bg"
            >
              {'The science of certainty,\nin every molecule.'}
            </SplitReveal>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ duration: 0.95, delay: 0.55, ease: EASE }}
              className="mx-auto mt-7 max-w-xl text-base leading-[1.55] text-bg/75 lg:text-lg"
            >
              Every peptide HPLC-verified. Every batch documented. Every milligram clearly specified, uncompromising
              quality in every peptide pen.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ duration: 0.9, delay: 0.75, ease: EASE }}
              className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4"
            >
              <CtaLink to="/products" variant="solid-light" arrow>
                Explore More
              </CtaLink>
              <CtaLink to="/contact" variant="outline-light">
                Contact Us
              </CtaLink>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
