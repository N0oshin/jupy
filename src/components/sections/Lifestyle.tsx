import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Heading from '../ui/Heading'

export default function Lifestyle() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])
  const y2 = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.00, 1])

  return (
    <section id="lifestyle" ref={ref} className="section-pad relative overflow-hidden bg-bg">
      <div className="container-x">
        <div className="mb-10">
          {/* Same eyebrow / title scale as the Difference, Craft and Research
              Standard sections, left-aligned like them. */}
          <Heading
            eyebrow="Inside The Lab"
            eyebrowGap="mb-5"
            className="[&_h2]:text-balance [&_h2]:text-[clamp(1.35rem,0.9rem+1.7vw,2.1rem)] [&_.eyebrow]:text-[0.8rem]"
            title={'Research-grade peptides\nfor the serious bench.'}
          />
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
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-accent-dark/10 via-transparent to-transparent" />
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
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-accent-dark/10 via-transparent to-transparent" />
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-[var(--radius-xl2)] bg-accent-dark p-8 text-bg sm:col-span-5">
            <p className="font-display text-lg font-light leading-[1.35] sm:text-xl lg:text-2xl">“The COA is provided with every peptide pen. Clear batch data, transparent testing and no guesswork.”</p>
            {/* /90 not /60: on the accent-dark panel, white at 60% resolves to
                #9fc8c5 → 3.0:1, under the AA floor for text this size. */}
            <p className="mt-5 text-[0.62rem] uppercase tracking-[0.22em] text-bg/90">A Jupyter Labs researcher</p>
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
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-accent-dark/10 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
