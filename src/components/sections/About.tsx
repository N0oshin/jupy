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
    <section id="about" ref={ref} className="section-pad-lg relative overflow-hidden bg-section">
      {/* Ambient ornaments */}
      <div className="pointer-events-none absolute -right-40 top-20 h-[34rem] w-[34rem] rounded-full bg-accent/15 blur-[140px]" />
      <div className="pointer-events-none absolute -left-32 bottom-20 h-[28rem] w-[28rem] rounded-full bg-sand/30 blur-[120px]" />

      <div className="container-x relative">
        {/* ───── HERO ───── */}
        <div className="grid items-end gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4">
              <span className="h-px w-14 bg-accent-dark" />
              <p className="eyebrow">Our Mission · Since 2019</p>
            </div>

            <SplitReveal
              as="h2"
              mode="lines"
              className="type-section-xl mt-7 font-display font-medium leading-[0.98] tracking-[-0.035em] text-ink"
            >
              {/* Heading text from the SEO sheet's "#about" entry. Deliberately
                  still an <h2>, not an <h1>: #about is an anchor on the
                  homepage, not its own page, and the homepage's single primary
                  H1 is the hero ("Smarter Peptides For Modern Research"), which
                  the same sheet specifies. Promoting this to H1 would put two
                  H1s on one document. Styling and the anchor are untouched. */}
              {'Explore Jupyter Lab\nPeptides'}
            </SplitReveal>
          </div>

          <div className="lg:col-span-4">
            <Reveal delay={0.2}>
              <p className="text-[1.05rem] leading-[1.55] text-muted text-pretty">
                Founded by two scientists frustrated by a lack of transparency in peptide sourcing, Jupyter Labs was
                created to give researchers <em className="not-italic text-ink">greater confidence in every product</em>,
                with HPLC-verified compounds, lot-level traceability and clearly specified dosing across every peptide
                pen.
              </p>
              <Magnetic className="mt-7 inline-block">
                <a
                  href="#products"
                  className="group inline-flex items-center gap-3 rounded-full border border-ink/15 px-5 py-2.5 text-sm text-ink transition-all hover:border-accent-dark hover:text-accent-dark"
                >
                  Read the methodology
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
              </Magnetic>
            </Reveal>
          </div>
        </div>

        {/* ───── COUNTER ROW ───── */}
        <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-xl2)] bg-line sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="bg-bg p-7">
              <div className="flex items-baseline gap-1">
                <Counter to={s.v} />
                <span className="font-display text-3xl font-light text-accent-dark">{s.suffix}</span>
              </div>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>

        {/* ───── BENTO ATLAS ───── */}
        <div className="mt-14 lg:mt-20">
          <div className="mb-10 flex items-center gap-4">
            <span className="h-px w-10 bg-accent-dark/40" />
            <p className="text-xs uppercase tracking-[0.22em] text-muted">The Atlas — who, where, why</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
            {/* TILE A — Portrait */}
            <Reveal className="bento-tile relative overflow-hidden rounded-[var(--radius-xl2)] lg:col-span-7 lg:row-span-2">
              <div className="aspect-[4/5] lg:aspect-auto lg:h-full">
                <Img src="/images/jupyter-labs/jupyter-labs-origin-copenhagen-2019.webp" alt="Jupyter Labs — the first synthesis, Copenhagen 2019" className="h-full w-full" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/35 to-transparent p-7 lg:p-10">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="text-[0.7rem] uppercase tracking-[0.25em] text-bg/80">Copenhagen · 2019</span>
                </div>
                <p className="mt-3 font-display text-2xl font-light leading-[1.15] text-bg lg:text-3xl">
                  The first synthesis. The whole question, answered.
                </p>
              </div>
              <span className="absolute right-5 top-5 rounded-full bg-bg/15 px-3 py-1 text-[0.65rem] uppercase tracking-[0.22em] text-bg backdrop-blur-md">
                Origin
              </span>
            </Reveal>

            {/* TILE B — Pull quote */}
            <Reveal
              delay={0.05}
              className="bento-tile relative flex flex-col justify-between rounded-[var(--radius-xl2)] bg-ink p-8 text-bg lg:col-span-5"
            >
              <div className="font-display text-5xl leading-none text-accent">"</div>
              <p className="-mt-4 font-display text-[clamp(1.25rem,1.8vw,1.6rem)] font-light leading-[1.25] text-bg">
                We refused to release a single milligram we couldn't verify by HPLC. That refusal became the whole company.
              </p>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-bg/60">— The Founders</span>
                <span className="h-px w-14 bg-accent" />
              </div>
            </Reveal>

            {/* TILE C — EST 2019 giant numeral */}
            <Reveal
              delay={0.1}
              className="bento-tile relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-xl2)] bg-accent-dark p-8 text-bg lg:col-span-5"
            >
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-bg/70">Vintage</span>
              <div className="font-display text-[clamp(5rem,11vw,9rem)] font-light leading-[0.85] tracking-[-0.05em] text-bg">
                2019
              </div>
              <div className="flex items-end justify-between gap-4">
                <p className="max-w-[14rem] text-sm leading-[1.4] text-bg/80">
                  Six years. Every batch HPLC-verified. Every certificate published. No exceptions.
                </p>
                <span className="font-display text-3xl text-bg/30">↗</span>
              </div>
              <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 blur-2xl" />
            </Reveal>
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
    <span ref={ref} className="font-display text-[clamp(2.6rem,4.5vw,4rem)] font-light leading-[0.9] tracking-[-0.04em] text-ink">
      {val}
    </span>
  )
}
