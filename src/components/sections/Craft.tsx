import { motion } from 'framer-motion'
import Heading from '../ui/Heading'
import Reveal from '../ui/Reveal'
import Img from '../ui/Img'

const PILLARS = [
  { t: 'Carefully Sourced Ingredients', d: 'We partner with qualified suppliers and trusted laboratories to source research compounds with documented origins and consistent quality standards.' },
  { t: 'Independently Tested', d: 'Each research compound is evaluated for key quality attributes, including identity, purity, and potency, with analytical testing performed throughout the quality-control process.' },
  { t: 'Precision-Focused Production', d: 'Controlled production runs allow us to maintain close oversight of every peptide pen, helping ensure consistent quality and reliable handling from manufacturing through shipment.' },
]

export default function Craft() {
  return (
    <section id="craft" className="relative bg-[#fdfcf8] pb-10 pt-0 lg:pb-14">
      <div className="container-x">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-stretch lg:gap-12">
          <div className="order-2 lg:order-1">
            <Heading
              eyebrow="How We Make It"
              eyebrowGap="mb-5"
              className="[&_h2]:max-w-[14em] [&_h2]:text-balance [&_h2]:text-[clamp(1.35rem,0.9rem+1.7vw,2.1rem)] [&_.eyebrow]:text-[0.8rem] [&_p.type-sub]:text-[0.9rem] [&_p.type-sub]:!mt-3"
              title={'Crafted with\nuncompromising precision.'}
              intro="From the active ingredient to the final seal on every peptide pen, each stage is guided by one uncompromising standard: quality at every step, without shortcuts."
            />
            <div className="mt-6 space-y-2">
              {PILLARS.map((p, i) => (
                <Reveal key={p.t} delay={i * 0.08}>
                  <div className="group relative overflow-hidden rounded-2xl bg-bg/60 p-4 backdrop-blur-sm transition-all duration-500 hover:-translate-y-0.5 hover:bg-bg hover:shadow-[0_18px_40px_-22px_rgba(42,15,18,0.25)]">
                    <div className="flex items-start gap-4">
                      <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-dark to-accent text-bg shadow-[0_8px_20px_-8px_rgba(121,13,22,0.5)] transition-transform duration-500 group-hover:scale-110">
                        <span className="font-display text-[0.65rem] font-medium tracking-tight">0{i + 1}</span>
                        <span className="absolute inset-0 rounded-full ring-1 ring-bg/15" />
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-display text-base font-medium leading-[1.2] text-ink">{p.t}</h3>
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="mt-1 shrink-0 -translate-x-2 text-accent-dark opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-70"
                          >
                            <path d="M1 8h14M9 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="mt-1.5 text-sm leading-[1.5] text-muted">{p.d}</p>
                      </div>
                    </div>
                    <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-accent-dark via-accent to-transparent transition-all duration-700 group-hover:w-full" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-[28rem] lg:order-2 lg:mx-0 lg:mt-2 lg:self-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl2)]">
              <div className="absolute inset-0">
                <Img
                  src="/images/ecom/craft-retatrutide.webp"
                  alt="Smiling woman in a green suit holding an Alluvi Retatrutide 40mg box against a warm beige backdrop"
                  sizes="(min-width: 1024px) 700px, 90vw"
                  className="h-full w-full"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-accent-dark/10 via-transparent to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="glass relative mr-auto mt-4 w-48 rounded-2xl px-4 py-3 sm:absolute sm:-bottom-6 sm:-right-4 sm:mr-0 sm:mt-0 sm:w-48 lg:-right-5"
            >
              <div className="font-display text-xl font-light leading-[1.1] text-accent-dark">12 checks</div>
              <p className="mt-1 text-[0.68rem] leading-[1.4] text-muted">Quality checks per batch. From the active compound to the final seal on every peptide pen.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
