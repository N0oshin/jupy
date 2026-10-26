import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Heading from '../ui/Heading'
import Reveal from '../ui/Reveal'
import { FAQS } from '../../lib/content'
import { useReducedMotion } from '../../lib/useReducedMotion'

const LUX = [0.16, 1, 0.3, 1] as const

/**
 * FAQ — shipping, dosing, returns and legality, as a single-open accordion.
 * The copy lives in lib/content (FAQS) so App can emit it as FAQPage JSON-LD.
 * The first item is open on load so the section never reads as an empty list.
 */
export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" aria-labelledby="faq-title" className="relative bg-bg section-pad">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div id="faq-title">
          <Heading
            eyebrow="Questions"
            eyebrowGap="mb-5"
            // Same type scale as the Difference / Craft / Benefits sections.
            className="[&_h2]:text-balance [&_h2]:text-[clamp(1.35rem,0.9rem+1.7vw,2.1rem)] [&_.eyebrow]:text-[0.8rem] [&_p.type-sub]:text-[0.9rem] [&_p.type-sub]:!mt-3"
            title={'Before you\norder.'}
            intro="Shipping, documentation, returns and the research-use-only status of everything we sell."
          />
          <Reveal delay={0.25}>
            <p className="mt-8 text-[0.9rem] text-muted">
              Something else?{' '}
              <Link to="/contact" className="text-accent-dark underline underline-offset-4 transition-colors hover:text-accent">
                Contact the lab
              </Link>
              .
            </p>
          </Reveal>
        </div>

        <ul className="divide-y divide-line border-y border-line">
          {FAQS.map((f, i) => (
            <Item key={f.q} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}

function Item({ q, a, open, onToggle, index }: { q: string; a: string; open: boolean; onToggle: () => void; index: number }) {
  const reduced = useReducedMotion()
  const id = useId()
  return (
    <li>
      <Reveal delay={0.05 * index} y={16} blur={false}>
        <h3>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-panel`}
            onClick={onToggle}
            className="group flex w-full items-start justify-between gap-6 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-dark/50 md:py-5"
          >
            <span className="font-jost text-base font-medium leading-[1.25] tracking-[-0.01em] text-muted transition-colors group-hover:text-accent-dark lg:text-lg">
              {q}
            </span>
            {/* Plus that turns into a minus. */}
            <span aria-hidden="true" className="relative mt-1.5 h-4 w-4 shrink-0 text-accent-dark">
              <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
              <span
                className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-500 ease-[var(--ease-lux)] ${
                  open ? 'scale-y-0' : 'scale-y-100'
                }`}
              />
            </span>
          </button>
        </h3>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={`${id}-panel`}
              key="panel"
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduced ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: LUX }}
              className="overflow-hidden"
            >
              <p className="max-w-[46rem] pb-6 pr-10 text-[0.9rem] leading-[1.6] text-muted text-pretty">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Reveal>
    </li>
  )
}
