import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SplitReveal from '../ui/SplitReveal'

export default function Lifestyle() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])
  const y2 = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.00, 1])

  return (
    <section id="lifestyle" ref={ref} className="section-pad relative overflow-hidden bg-section">
      <div className="container-x">
        <div className="mb-12 text-center">
          <p className="eyebrow mb-5">Inside The Lab</p>
          <SplitReveal as="h2" mode="lines" className="display mx-auto max-w-3xl text-balance text-[clamp(1.85rem,1rem+3.4vw,4rem)] text-ink">
            Research-grade peptides for the serious bench.
          </SplitReveal>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:gap-6">
          <div className="overflow-hidden rounded-[var(--radius-xl2)] sm:col-span-7">
            <div className="relative aspect-[16/10] overflow-hidden">
              <motion.div style={{ y: y1, scale }} className="absolute -inset-y-[15%] inset-x-0">
                <img
                  src="/images/ecom/Gemini_Generated_Image_38kvj38kvj38kvj3.webp"
                  alt="Peptide liquid in laboratory glassware — Jupyter Labs workflow"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-xl2)] sm:col-span-5">
            <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto sm:h-full">
              <motion.div style={{ y: y2 }} className="absolute -inset-y-[15%] inset-x-0">
                <img
                  src="/images/jupyter-labs/inside-jupyter-labs-research-facility-2.webp"
                  alt="Glow peptide — Jupyter Labs research compound"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-[var(--radius-xl2)] bg-accent-dark p-8 text-bg sm:col-span-5">
            <p className="font-display text-xl font-light leading-[1.35] sm:text-2xl lg:text-3xl">“The COA is provided with every peptide pen. Clear batch data, transparent testing and no guesswork.”</p>
            {/* /90 not /60: on the accent-dark panel, white at 60% resolves to
                #9fc8c5 → 3.0:1, under the AA floor for text this size. */}
            <p className="mt-5 text-xs uppercase tracking-[0.25em] text-bg/90 sm:text-sm">A Jupyter Labs researcher</p>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-xl2)] sm:col-span-7">
            <div className="relative aspect-[16/9] overflow-hidden">
              <motion.div style={{ y: y1 }} className="absolute -inset-y-[15%] inset-x-0">
                <img
                  src="/images/jupyter-labs/inside-jupyter-labs-research-facility-3.webp"
                  alt="Model holding an Alluvi peptide pen against a golden backdrop"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
