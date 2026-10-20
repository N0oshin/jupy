import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'
import SplitReveal from '../ui/SplitReveal'
import Reveal from '../ui/Reveal'
import Img from '../ui/Img'
import Magnetic from '../ui/Magnetic'

const STATS = [
  { v: 47, suffix: '+', label: 'Studies referenced' },
  { v: 100, suffix: '%', label: 'HPLC verified' },
  { v: 40, suffix: 'K', label: 'Researchers worldwide' },
] as const

export default function About() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced) return

      gsap.utils.toArray<HTMLElement>('.bento-tile').forEach((el, i) => {
        gsap.to(el, {
          yPercent: i % 2 === 0 ? -4 : 4,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section id="about" ref={ref} className="relative overflow-hidden bg-section py-10 lg:py-14">
      {/* Ambient ornaments */}
      <div className="pointer-events-none absolute -right-40 top-20 h-[34rem] w-[34rem] rounded-full bg-accent/15 blur-[140px]" />
      <div className="pointer-events-none absolute -left-32 bottom-20 h-[28rem] w-[28rem] rounded-full bg-sand/30 blur-[120px]" />

      <div className="container-x relative">
        {/* ───── HERO ───── */}
        <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-accent-dark" />
              <p className="eyebrow !text-[0.8rem]">Our Mission · Since 2019</p>
            </div>

            <SplitReveal
              as="h2"
              mode="lines"
              className="mt-4 font-display text-[clamp(1.35rem,0.9rem+1.7vw,2.1rem)] font-medium leading-[1.08] tracking-[-0.015em] text-ink"
            >
              {/* Heading text from the SEO sheet's "#about" entry. Deliberately
                  still an <h2>, not an <h1>: #about is an anchor on the
                  homepage, not its own page, and the homepage's single primary
                  H1 is the hero ("Research-grade peptides, verified in every pen."), which
                  the same sheet specifies. Promoting this to H1 would put two
                  H1s on one document. Styling and the anchor are untouched. */}
              {'Explore Jupyter Lab\nPeptides'}
            </SplitReveal>
          </div>

          <div className="lg:col-span-4">
            <Reveal delay={0.2}>
         
              <Magnetic className="mt-4 inline-block">
                <a
                  href="#products"
                  className="group inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-xs text-ink transition-all hover:border-accent-dark hover:text-accent-dark"
                >
                  Read the methodology
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
              </Magnetic>
            </Reveal>
          </div>
        </div>

        {/* ───── COUNTER ROW ───── */}
        <div className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-xl2)] bg-line sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="bg-bg p-5">
              <div className="flex items-baseline gap-1">
                <Counter to={s.v} />
                <span className="font-display text-xl font-light text-accent-dark">{s.suffix}</span>
              </div>
              <p className="mt-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>

        {/* ───── BENTO ATLAS ───── */}
        <div className="mt-10 lg:mt-12">
          {/* Portrait on the left (a clean 4:5, so her face and two boxes both fit),
              story on the right: headline, then the quote and the vintage tile side by side. */}
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-5 mt-20">
            {/* TILE A — Portrait */}
            <Reveal className="bento-tile relative overflow-hidden rounded-[var(--radius-xl2)] lg:col-span-5">
              <div className="aspect-[4/5]">
                <Img
                  src="/images/ecom/atlas-natural.webp"
                  alt="Smiling woman with curly hair hugging a stack of Alluvi Tesamorelin, CJC-1295 and MOTS-C boxes against a warm beige backdrop"
                  sizes="(min-width: 1024px) 540px, 100vw"
                  objectPosition="50% 10%"
                  className="h-full w-full"
                />
              </div>
              <span className="absolute left-4 top-4 rounded-full bg-bg/25 px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.22em] text-ink backdrop-blur-md">
                Origin
              </span>
            </Reveal>

            <div className="flex flex-col gap-4 lg:col-span-7 lg:gap-5">
              {/* Headline — sits on the section, no card */}
              <Reveal delay={0.05} className="pt-5 lg:pt-2">
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="text-[0.62rem] uppercase tracking-[0.25em] text-muted">The Atlas — who, where, why</span>
                </div>
                <p className="mt-3 max-w-[22ch] font-display text-[clamp(1.5rem,0.9rem+1.9vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.015em] text-ink">
                  The first synthesis. The whole question, answered.
                </p>
              </Reveal>

              <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:gap-5">
                {/* TILE B — Pull quote */}
                <Reveal
                  delay={0.1}
                  className="bento-tile relative flex flex-col justify-between rounded-[var(--radius-xl2)] bg-ink p-5 text-bg lg:p-6"
                >
                  <div className="font-display text-4xl leading-none text-accent">"</div>
                  <p className="-mt-2 font-display text-[clamp(1.05rem,1.4vw,1.3rem)] font-light leading-[1.3] text-bg">
                    We refused to release a single milligram we couldn't verify by HPLC. That refusal became the whole company.
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-[0.6rem] uppercase tracking-[0.22em] text-bg/60">— The Founders</span>
                    <span className="h-px w-10 bg-accent" />
                  </div>
                </Reveal>

                {/* TILE C — EST 2019 giant numeral */}
                <Reveal
                  delay={0.15}
                  className="bento-tile relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-xl2)] bg-accent-dark p-5 text-bg lg:p-6"
                >
                  <span className="text-[0.6rem] uppercase tracking-[0.25em] text-bg/70">Vintage</span>
                  <div className="my-6 font-display text-[clamp(3.5rem,6.5vw,5.5rem)] font-light leading-[0.85] tracking-[-0.015em] text-bg">
                    2019
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <p className="max-w-[13rem] text-xs leading-[1.4] text-bg/80">
                      Six years. Every batch HPLC-verified. Every certificate published. No exceptions.
                    </p>
                    <span className="font-display text-xl text-bg/30">↗</span>
                  </div>
                  <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 blur-2xl" />
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Count-up number triggered when scrolled into view. */
function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      setVal(to)
      return
    }
    const el = ref.current
    if (!el) return
    let started = false
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started) {
            started = true
            const obj = { n: 0 }
            gsap.to(obj, {
              n: to,
              duration: 1.8,
              ease: 'power3.out',
              onUpdate: () => setVal(Math.round(obj.n)),
            })
            io.disconnect()
          }
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to, reduced])

  return (
    <span ref={ref} className="font-display text-[clamp(1.75rem,2.8vw,2.5rem)] font-light leading-[0.9] tracking-[-0.015em] text-ink">
      {val}
    </span>
  )
}
