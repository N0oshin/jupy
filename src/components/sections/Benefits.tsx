import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'
import Heading from '../ui/Heading'
import { BENEFITS } from '../../lib/content'

export default function Benefits() {
  const ref = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // Horizontal pinned scroll on desktop.
  useGSAP(
    () => {
      if (reduced || !track.current || !ref.current) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const t = track.current!
        const distance = t.scrollWidth - window.innerWidth + 80
        gsap.to(t, {
          x: -distance,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current!,
            start: 'top top',
            end: () => `+=${distance}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section id="benefits" ref={ref} className="section-pad relative overflow-hidden bg-bg lg:py-0">
      <div className="lg:flex lg:min-h-screen lg:items-center">
        <div ref={track} className="lg:flex lg:items-center lg:gap-10 lg:px-20">
          <div className="container-x lg:w-[42vw] lg:shrink-0 lg:px-0">
            <Heading
              eyebrow="The Research Standard"
              title={'What ships\nwith every batch.'}
              intro="Every Jupyter Labs compound is supplied as a research reference material — verified for purity, independently tested, fully documented and stability-protected from synthesis to storage."
            />
          </div>

          <div className="container-x mt-14 grid gap-6 sm:grid-cols-2 lg:mt-0 lg:flex lg:px-0">
            {BENEFITS.map((b) => (
              <div
                key={b.k}
                className="group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-card transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-accent-dark/30 hover:shadow-[0_30px_60px_-30px_rgba(121,13,22,0.45)] lg:h-[58vh] lg:w-[24rem] lg:shrink-0"
              >
                {/* Full-bleed image */}
                <img
                  src={b.image}
                  alt={b.t}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
                  style={{ objectPosition: b.k === '01' ? '75% 50%' : '50% 50%' }}
                  loading="lazy"
                  decoding="async"
                />

                {/* Card cover over lower portion — fades on hover so image fills card */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 top-48 bg-card transition-opacity duration-700 group-hover:opacity-0 lg:top-72" />

                {/* Dark gradient overlay — appears on hover so text stays readable on image */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                {/* Top accent rail */}
                <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-gold transition-transform duration-700 ease-out group-hover:scale-x-100" />

                {/* Chip */}
                <span className="absolute left-5 top-5 z-10 rounded-full bg-bg/95 px-3 py-1 text-[0.65rem] uppercase tracking-[0.22em] text-ink backdrop-blur-md transition-all duration-500 group-hover:-translate-y-0.5 group-hover:bg-gold">
                  Standard · {b.k}
                </span>

                {/* Image height spacer */}
                <div className="h-48 lg:h-72" aria-hidden />

                {/* Content */}
                <div className="relative flex flex-1 flex-col justify-between p-7 lg:p-8">
                  {/* accent-dark/70, not sand: --color-sand (#a9d6cf) sits at 1.59:1 on
                      white — these numerals are content, not decoration, so they need
                      the 3:1 large-text floor. This keeps the soft muted teal at 3.1:1. */}
                  <span className="font-display text-4xl font-light text-accent-dark/70 transition-colors duration-500 group-hover:text-gold">
                    {b.k}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-medium leading-[1.2] text-ink transition-colors duration-500 group-hover:text-bg">{b.t}</h3>
                    <p className="mt-3 text-base leading-[1.4] text-muted transition-colors duration-500 group-hover:text-bg/85">{b.d}</p>
                  </div>
                  <div className="mt-8 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-700 group-hover:scale-x-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
