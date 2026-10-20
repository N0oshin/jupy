import { motion } from 'framer-motion'
import Heading from '../ui/Heading'
import Reveal from '../ui/Reveal'
import Img from '../ui/Img'

const PILLARS = [
  { t: 'HPLC-Verified Purity', d: 'Each peptide pen undergoes high-performance liquid chromatography (HPLC) analysis to verify its specified composition and purity. Every batch is documented with research-focused quality data for greater confidence in your laboratory work.' },
  { t: 'Consistent Batch Quality', d: 'Our controlled production process is designed to maintain consistent specifications across batches and individual peptide pens, supporting dependable and reproducible laboratory research.' },
  { t: 'Temperature Controlled Packaging', d: 'Each peptide pen is packaged with stability and storage requirements in mind, helping protect the research compound from environmental exposure during handling, storage, and transit from production to your laboratory bench.' },
]

export default function Difference() {
  return (
    <section id="difference" className="relative bg-[#fdfcf8] py-10 lg:py-14">
      <div className="container-x">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:items-stretch lg:gap-12">
          <div className="relative mx-auto w-full max-w-[28rem] lg:mx-0 lg:mt-2 lg:self-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl2)]">
              <div className="absolute inset-0">
                <Img
                  src="/images/ecom/standard-tirzepatide.webp"
                  alt="Brunette woman holding an Alluvi Tirzepatide 40mg box against a warm beige backdrop"
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
              className="glass relative ml-auto mt-4 w-48 rounded-2xl px-4 py-3 sm:absolute sm:-bottom-6 sm:-right-4 sm:mt-0 sm:w-48 lg:-right-5"
            >
              <div className="font-display text-xl font-light leading-[1.1] text-accent-dark">99%+ pure</div>
              <p className="mt-1 text-[0.68rem] leading-[1.4] text-muted">HPLC-certified. Published purity report with every batch.</p>
            </motion.div>
          </div>

          <div>
            <Heading
              eyebrow="The Jupyter Labs Standard"
              eyebrowGap="mb-5"
              className="[&_h2]:text-balance [&_h2]:text-[clamp(1.35rem,0.9rem+1.7vw,2.1rem)] [&_.eyebrow]:text-[0.8rem] [&_p.type-sub]:text-[0.9rem] [&_p.type-sub]:!mt-3"
              title={'Research-grade peptides,\nformulated for precision.'}
              intro="Every Jupyter Labs peptide pen is engineered for the modern research environment, combining HPLC-verified purity, stringent quality standards, and controlled stability from synthesis through formulation, filling, and delivery to your laboratory bench."
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
        </div>
      </div>
    </section>
  )
}
