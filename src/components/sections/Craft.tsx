import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Heading from '../ui/Heading'
import Reveal from '../ui/Reveal'
import Img from '../ui/Img'

const PILLARS = [
  { t: 'Sourced at Origin', d: 'We work directly with certified synthesis labs to bring traceable, research-grade compounds to your bench.' },
  { t: 'Tested at Every Stage', d: 'Identity, potency, purity — verified before, during, and after manufacture by independent labs.' },
  { t: 'Made in Small Batches', d: 'Limited runs mean fresher compounds and tighter quality control on every single kit we produce.' },
]

export default function Craft() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '12%'])

  return (
    <section id="craft" className="section-pad relative bg-bg">
      <div className="container-x">
        <div className="grid items-start gap-14 lg:grid-cols-2 lg:items-stretch">
          <div className="order-2 lg:order-1 lg:pt-8">
            <Heading
              eyebrow="How We Make It"
              title={'Crafted with\nuncompromising care.'}
              intro="From the raw compound to the seal on the research device, every step is held to a single rule — do it right, or don't do it at all."
            />
            <div className="mt-16 space-y-3">
              {PILLARS.map((p, i) => (
                <Reveal key={p.t} delay={i * 0.08}>
                  <div className="group relative overflow-hidden rounded-2xl bg-card/40 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-0.5 hover:bg-card hover:shadow-[0_18px_40px_-22px_rgba(31,41,51,0.25)]">
                    <div className="flex items-start gap-5">
                      <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-dark to-accent text-bg shadow-[0_8px_20px_-8px_rgba(68,88,82,0.5)] transition-transform duration-500 group-hover:scale-110">
                        <span className="font-display text-xs font-medium tracking-tight">0{i + 1}</span>
                        <span className="absolute inset-0 rounded-full ring-1 ring-bg/15" />
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-display text-xl font-medium leading-[1.2] text-ink">{p.t}</h3>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="mt-1 shrink-0 -translate-x-2 text-accent-dark opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-70"
                          >
                            <path d="M1 8h14M9 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="mt-2 text-base leading-[1.5] text-muted">{p.d}</p>
                      </div>
                    </div>
                    <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-accent-dark via-accent to-transparent transition-all duration-700 group-hover:w-full" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div ref={ref} className="relative order-1 lg:order-2 lg:h-full">
            <div className="relative aspect-[8/9] overflow-hidden rounded-[var(--radius-xl2)] lg:aspect-auto lg:h-full lg:min-h-[34rem]">
              <motion.div style={{ y }} className="absolute inset-0 scale-110">
                <Img src="/images/jupyter-labs/jupyter-labs-peptide-manufacturing-process.webp" alt="Jupyter Labs craftsmanship and laboratory process" className="h-full w-full" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-accent-dark/30 via-transparent to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="glass absolute bottom-4 left-4 w-48 rounded-3xl p-6 sm:-bottom-8 sm:-left-4 sm:w-56 lg:-left-10"
            >
              <div className="font-display text-3xl font-light leading-[1.2] text-accent-dark">12 checks</div>
              <p className="mt-2 text-sm text-muted">per batch — from raw compound to the seal on every research device.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
