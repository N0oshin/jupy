import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { responsive } from '../../lib/responsiveImage'

const STEPS = [
  {
    k: 'Discover',
    t: 'It starts with the evidence',
    d: 'Every formulation starts with the science. Our team reviews extensive research and published literature to identify compounds supported by credible, reproducible findings.',
    img: '/images/jupyter-labs/peptide-research-discovery-phase.webp',
  },
  {
    k: 'Formulate',
    t: 'Dosed to the research',
    d: 'We turn scientific evidence into clearly defined formulations and specified doses. No proprietary blends, no unnecessary fillers and no guesswork.',
    img: '/images/jupyter-labs/peptide-formulation-development.webp',
  },
  {
    k: 'Validate',
    t: 'Tested, then tested again',
    d: 'Independent laboratories evaluate every batch for identity, potency, and purity. Only batches that meet our defined quality standards are cleared for release.',
    img: '/images/jupyter-labs/peptide-validation-quality-testing.webp',
  },
]

export default function Science() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  const total = STEPS.length

  useGSAP(
    () => {
      if (reduced || !ref.current) return

      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: () => `+=${total * 100}%`,
        pin: '.science-pin',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => setActive(Math.min(total - 1, Math.floor(self.progress * total))),
      })

      // overall scrub progress bar
      const bar = gsap.fromTo(
        '.science-bar',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: () => `+=${total * 100}%`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      )

      return () => {
        st.kill()
        bar.scrollTrigger?.kill()
        bar.kill()
      }
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section id="science" ref={ref} className="relative bg-accent-dark text-bg">
      <div className="science-pin relative flex min-h-[100svh] flex-col justify-center overflow-hidden">
        {/* atmosphere */}
        <div className="absolute inset-0 grain opacity-25" />
        <div className="absolute -left-44 top-0 h-[34rem] w-[34rem] rounded-full bg-gold/15 blur-[130px]" />
        <div className="absolute -right-36 bottom-0 h-[30rem] w-[30rem] rounded-full bg-accent/45 blur-[130px]" />

        <div className="container-x relative flex w-full flex-col py-16 lg:py-20">
          {/* header row */}
          <div className="flex items-center justify-between gap-4 border-b border-bg/10 pb-6">
            <p className="eyebrow !text-gold">Science Behind Every Formula</p>
            <span className="font-display text-sm tracking-[0.25em] text-bg/55">
              0{active + 1}
              <span className="text-bg/25"> / 0{total}</span>
            </span>
          </div>

          {/* main */}
          <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_1.08fr] lg:gap-14 lg:py-14">
            {/* text scenes */}
            <div className="relative order-2 lg:order-1">
              {/* watermark step number */}
              <div className="pointer-events-none mb-4 font-display text-[clamp(3.5rem,8vw,7rem)] font-extralight leading-none text-gold/25">
                0{active + 1}
              </div>

              <div className="relative min-h-[14rem] sm:min-h-[13rem]">
                {STEPS.map((s, i) => (
                  <div
                    key={s.k}
                    className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      opacity: active === i ? 1 : 0,
                      transform: `translateY(${active === i ? 0 : active > i ? -24 : 24}px)`,
                      filter: active === i ? 'blur(0)' : 'blur(8px)',
                      pointerEvents: active === i ? 'auto' : 'none',
                    }}
                  >
                    <h3 className="font-display text-[clamp(1.9rem,3.4vw,2.75rem)] font-medium leading-[1.15]">{s.t}</h3>
                    <p className="mt-5 max-w-md text-xl leading-[1.5] text-bg/70">{s.d}</p>
                  </div>
                ))}
              </div>

              {/* step nav with progress segments */}
              <div className="mt-10 grid grid-cols-3 gap-4">
                {STEPS.map((s, i) => (
                  <div key={s.k}>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-bg/15">
                      <div
                        className={`h-full rounded-full bg-gold transition-[width] duration-700 ease-out ${
                          active >= i ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                    <span
                      className={`mt-3 block text-sm tracking-wide transition-colors duration-500 ${
                        active === i ? 'text-bg' : 'text-bg/40'
                      }`}
                    >
                      {s.k}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* visual — fills the column */}
            <div className="relative order-1 lg:order-2">
              <div className="relative h-[44vh] overflow-hidden rounded-[var(--radius-xl2)] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.6)] lg:h-[64vh]">
                {STEPS.map((s, i) => (
                  <div
                    key={`${s.k}-${s.img}`}
                    className="absolute inset-0 transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ opacity: active === i ? 1 : 0, transform: `scale(${active === i ? 1 : 1.08})` }}
                  >
                    <img
                      src={s.img}
                      {...responsive(s.img, '(min-width: 1024px) 50vw, 100vw')}
                      alt={s.t}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-accent-dark/75 via-accent-dark/10 to-transparent" />
                  </div>
                ))}

                {/* step chip */}
                <div className="absolute right-5 top-5 rounded-full border border-bg/25 bg-accent-dark/30 px-4 py-1.5 text-xs uppercase tracking-[0.22em] backdrop-blur-md">
                  {STEPS[active].k}
                </div>

                {/* COA badge */}
                <div className="glass absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-ink">
                  <span className="h-2 w-2 rounded-full bg-accent-dark" />
                  Batch-tested · COA available
                </div>
              </div>
            </div>
          </div>

          {/* overall progress bar */}
          <div className="h-px w-full overflow-hidden bg-bg/12">
            <div className="science-bar h-full origin-left bg-gold" />
          </div>
        </div>
      </div>
    </section>
  )
}
