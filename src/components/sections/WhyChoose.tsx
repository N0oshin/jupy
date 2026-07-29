import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'
import SplitReveal from '../ui/SplitReveal'
import Reveal from '../ui/Reveal'
import Img from '../ui/Img'
import Magnetic from '../ui/Magnetic'

const PILLARS = [
  { n: '01', t: 'Sourced', d: 'Single-origin peptides, traced from synthesis to bench — never anonymized.', image: '/images/jupyter-labs/ethically-sourced-research-peptides.webp' },
  { n: '02', t: 'Dosed', d: 'Calibrated to the published clinical literature. Every milligram on the label.', image: '/images/jupyter-labs/precision-dosed-peptide-vials.webp' },
  { n: '03', t: 'Tested', d: 'HPLC-verified by independent labs. Certificate published with every lot.', image: '/images/jupyter-labs/hplc-tested-peptide-purity.webp' },
  { n: '04', t: 'Crafted', d: 'Sealed containers and stability-grade packaging — built to preserve peptide integrity from synthesis to bench.', image: '/images/jupyter-labs/expertly-crafted-research-peptides.webp' },
] as const

export default function WhyChoose() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      gsap.to('.hero-img', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: '.hero-img', start: 'top bottom', end: 'bottom top', scrub: true },
      })
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section id="why" ref={ref} className="section-pad-lg relative overflow-hidden bg-bg">
      <div className="container-x relative">
        {/* ───── EDITORIAL HEADER ───── */}
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-ink/30" />
              <p className="text-[0.7rem] uppercase tracking-[0.3em] text-muted">Why Jupyter Labs</p>
            </div>

            <SplitReveal
              as="h2"
              mode="lines"
              className="type-section mt-5 font-display font-medium leading-[1.08] tracking-[-0.015em] text-ink"
            >
              {'Proof, in writing.\nPeptides, in your hand.'}
            </SplitReveal>
          </div>

          <div className="lg:col-span-4">
            <Reveal delay={0.2}>
              <p className="text-[1.05rem] leading-[1.55] text-muted text-pretty">
                We don't market peptides. We document them. Every active begins in the clinical literature and ends on
                the COA included with your kit.
              </p>
            </Reveal>
          </div>
        </div>

        {/* ───── FULL-WIDTH EDITORIAL FEATURE ───── */}
        <Reveal className="mt-16 lg:mt-20">
          <article className="relative overflow-hidden rounded-[var(--radius-xl2)]">
            <div className="hero-img relative min-h-[30rem] sm:min-h-0 sm:aspect-[16/9] lg:aspect-[21/9]">
              <Img
                src="/images/jupyter-labs/inside-jupyter-labs-scientist.webp"
                alt="A Jupyter Labs scientist running HPLC purity analysis inside the research facility"
                className="h-full w-full"
                sizes="(min-width: 1024px) 90vw, 100vw"
              />
            </div>

            {/* Gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/55 via-transparent to-transparent" />

            {/* Top metadata */}
            <div className="absolute inset-x-6 top-6 flex items-center justify-between text-bg lg:inset-x-10 lg:top-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-bg/20 bg-bg/10 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] backdrop-blur-md">
                <span className="text-accent">★</span> Feature
              </span>
              <span className="hidden text-[0.65rem] uppercase tracking-[0.25em] text-bg/70 sm:block">
                Pillar 01 · Methodology
              </span>
            </div>

            {/* Bottom caption */}
            <div className="absolute inset-x-5 bottom-5 grid gap-5 sm:inset-x-6 sm:bottom-6 sm:gap-8 lg:inset-x-10 lg:bottom-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="text-[0.7rem] uppercase tracking-[0.3em] text-bg/70">The hero principle</p>
                <h3 className="mt-4 font-display text-[clamp(1.8rem,4vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.03em] text-bg">
                  Every milligram, on the label. No exceptions.
                </h3>
                <p className="mt-4 max-w-xl text-[0.95rem] leading-[1.55] text-bg/75">
                  Calibrated to the published clinical literature, printed in milligrams, HPLC-verified before it
                  ever leaves the lab. You read the math the same way our scientists do.
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 lg:col-span-4 lg:justify-end">
                <Magnetic className="inline-block">
                  <a
                    href="#science"
                    className="group inline-flex items-center gap-3 rounded-full bg-bg px-6 py-3 text-sm text-ink transition-colors hover:bg-accent hover:text-bg"
                  >
                    Read methodology
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </Magnetic>
              </div>
            </div>
          </article>
        </Reveal>

        {/* ───── PILLAR ROW WITH HOVER IMAGES ───── */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal
              key={p.n}
              delay={i * 0.08}
              className="group relative flex flex-col gap-10 overflow-hidden bg-bg p-8 transition-colors duration-500 lg:p-10"
            >
              {/* Hover image — fills card, fades in */}
              <img
                src={p.image}
                alt={p.t}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                loading="lazy"
                decoding="async"
              />
              {/* Dark gradient for legibility on hover */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/20 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

              <div className="relative flex items-baseline justify-between">
                <span className="font-display text-sm font-medium text-accent-dark transition-colors duration-500 group-hover:text-gold">{p.n}</span>
                <span className="h-px w-10 bg-line transition-all duration-500 group-hover:w-16 group-hover:bg-gold" />
              </div>

              <div className="relative">
                <h4 className="font-display text-[clamp(1.6rem,2.2vw,2rem)] font-medium leading-[1.05] tracking-[-0.02em] text-ink transition-colors duration-500 group-hover:text-bg">
                  {p.t}.
                </h4>
                <p className="mt-3 text-[0.95rem] leading-[1.5] text-muted transition-colors duration-500 group-hover:text-bg/85">{p.d}</p>
              </div>

              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gold transition-transform duration-700 group-hover:scale-x-100" />
            </Reveal>
          ))}
        </div>

        {/* ───── TRUST FOOTNOTE ───── */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 text-sm">
          <p className="text-muted">
            <span className="text-ink">All claims verifiable.</span> All certificates available on request.
          </p>
          <p className="text-[0.7rem] uppercase tracking-[0.28em] text-muted">
            cGMP · HPLC-verified · COA published · Lot-traceable
          </p>
        </div>
      </div>
    </section>
  )
}
