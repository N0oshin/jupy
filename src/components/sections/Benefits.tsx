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
        // Measured on every ScrollTrigger refresh, not once at mount: fonts,
        // lazy images and the refreshes BelowFold fires all change the track's
        // width after this runs, and a stale distance stops the scroll short
        // of the last card.
        const distance = () => t.scrollWidth - window.innerWidth + 80
        gsap.to(t, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current!,
            start: 'top top',
            end: () => `+=${distance()}`,
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
              eyebrowGap="mb-5"
              // Same type scale as the Difference / Craft sections above.
              className="[&_h2]:text-balance [&_h2]:text-[clamp(1.35rem,0.9rem+1.7vw,2.1rem)] [&_.eyebrow]:text-[0.8rem] [&_p.type-sub]:text-[0.9rem] [&_p.type-sub]:!mt-3"
              title={'What ships\nwith every batch.'}
              intro="Every Jupyter Labs compound is supplied as a research reference material — verified for purity, independently tested, fully documented and stability-protected from synthesis to storage."
            />
          </div>

          <div className="container-x mt-14 grid gap-6 sm:grid-cols-2 lg:mt-0 lg:flex lg:px-0">
            {BENEFITS.map((b) => (
              <div
                key={b.k}
                tabIndex={0}
                aria-label={`${b.t}. ${b.d}`}
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-[#c9b8a8] shadow-[0_30px_60px_-30px_rgba(40,60,80,0.55)] outline-none ring-accent-dark/50 focus-visible:ring-2 lg:w-[20rem] lg:shrink-0"
              >
                {/* Photo: blurs and lightens on hover so the details sit on a calm surface. */}
                <img
                  src={b.image}
                  alt={b.t}
                  className="absolute inset-0 h-full w-full scale-[1.02] object-cover transition-[filter,transform] duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.06] group-hover:blur-[10px] group-hover:brightness-[1.12] group-focus-visible:scale-[1.06] group-focus-visible:blur-[10px] group-focus-visible:brightness-[1.12]"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />

                {/* Resting label, fades out as the details come up. */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent p-5 pt-16 text-ink transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0 lg:p-6">
                  <span className="font-display text-3xl font-light leading-none">{b.k}</span>
                  <h3 className="mt-2 font-display text-lg font-medium leading-[1.15] tracking-[-0.02em] lg:text-xl">{b.t}</h3>
                </div>

                {/* White scrim fading in with the blur. */}
                <div className="pointer-events-none absolute inset-0 bg-white/35 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />

                {/* Details over the blurred photo. */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-accent-dark opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 lg:p-6">
                  <div className="translate-y-4 transition-transform duration-700 ease-[var(--ease-lux)] group-hover:translate-y-0 group-focus-visible:translate-y-0">
                    <span className="font-display text-4xl font-light leading-none">{b.k}</span>
                    <p className="mt-4 text-[0.6rem] uppercase tracking-[0.22em] text-accent-dark/70">Standard · {b.k}</p>
                    <h3 className="mt-1.5 font-display text-xl font-medium leading-[1.15] tracking-[-0.02em] lg:text-2xl">{b.t}</h3>
                    <p className="mt-3 text-[0.8rem] leading-[1.5] text-accent-dark/80">{b.d}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
