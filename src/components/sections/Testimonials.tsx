import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TESTIMONIALS } from '../../lib/content'
import { responsive } from '../../lib/responsiveImage'
import { useReducedMotion } from '../../lib/useReducedMotion'

type T = (typeof TESTIMONIALS)[number]

const LUX = [0.16, 1, 0.3, 1] as const

/** Short, bold lead-ins for the cards that carry a headline. */
const HEADLINES = ['Exactly as certified.', 'I really appreciate it!', 'Good job!', '', '', 'A supplier we can audit.']

/**
 * Testimonials — a collage of mixed review cards, like a wall of pinned
 * notes: speech bubbles with a tail and the reviewer's photo tucked under
 * them, a tall portrait card, cards with a circular avatar breaking the top
 * edge, and a wide bubble with a bold lead-in. Each review gets its own card
 * shape so the grid reads as a scrapbook rather than a list.
 */
export default function Testimonials() {
  const reduced = useReducedMotion()
  const [a, b, c, d, , f] = TESTIMONIALS

  return (
    <section id="testimonials" aria-label="Testimonials" className="relative overflow-hidden bg-bg py-20 md:py-24 lg:py-28">
      {/* Faint dotted backdrop, like a pinboard. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{ backgroundImage: 'radial-gradient(rgba(42,15,18,0.12) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />

      <div className="container-x relative">
        <header className="mx-auto mb-12 max-w-xl text-center md:mb-14">
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-accent-dark/80">What labs say</p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,1.2rem+2.2vw,2.75rem)] font-light leading-tight text-ink">Testimonials</h2>
        </header>

        <div className="mx-auto grid max-w-[64rem] grid-cols-1 gap-x-5 gap-y-12 md:grid-cols-2 md:gap-y-12 lg:grid-cols-3 lg:gap-x-6">
          {/* 1 — Speech bubble, big quote mark, photo tucked under the right corner. */}
          <Reveal reduced={reduced} delay={0}>
            <Bubble tail="right">
              <QuoteMark />
              <p className="mt-2 text-[0.82rem] leading-[1.6] text-ink/80">{a.quote}</p>
              <Byline t={a} className="mt-5" />
              <Avatar t={a} size="md" className="absolute -bottom-7 right-5" />
            </Bubble>
          </Reveal>

          {/* 2 — Tall card: avatar breaking the top edge, stars, bold headline, closing quote mark. */}
          <Reveal reduced={reduced} delay={0.08}>
            <Card className="pt-12 text-center md:pt-12">
              <Avatar t={b} size="lg" className="absolute -top-7 left-1/2 -translate-x-1/2" />
              <Stars className="justify-center" />
              <h3 className="mt-4 font-display text-xl font-semibold leading-tight text-ink">{HEADLINES[1]}</h3>
              <p className="mt-4 text-[0.82rem] leading-[1.6] text-ink/75">{b.quote}</p>
              <Byline t={b} className="mt-6 items-center" />
              <span aria-hidden="true" className="mt-4 block select-none font-display text-[3.5rem] leading-[0.5] text-ink">
                &rdquo;
              </span>
            </Card>
          </Reveal>

          {/* 3 — "Good job!" card with avatar on top. */}
          <Reveal reduced={reduced} delay={0.16}>
            <Card className="pt-12 md:pt-12">
              <Avatar t={c} size="lg" className="absolute -top-7 left-6" />
              <h3 className="font-display text-lg font-semibold text-ink">{HEADLINES[2]}</h3>
              <Stars className="mt-2" />
              <p className="mt-4 text-[0.82rem] leading-[1.6] text-ink/75">{c.quote}</p>
              <Byline t={c} className="mt-5" />
            </Card>
          </Reveal>

          {/* 4 — Horizontal card: quote on the left, photo on the right. */}
          <Reveal reduced={reduced} delay={0.1}>
            <Card className="flex items-center gap-5">
              <div className="min-w-0 flex-1">
                <p className="text-[0.82rem] leading-[1.6] text-ink/80">{d.quote}</p>
                <Byline t={d} className="mt-4" />
              </div>
              <Avatar t={d} size="lg" className="shrink-0" />
            </Card>
          </Reveal>

          {/* 5 — Wide bubble with headline; photo and name below the tail. */}
          <Reveal reduced={reduced} delay={0.12} className="md:col-span-2">
            <Bubble tail="left" className="text-center md:text-left">
              <h3 className="font-display text-xl font-semibold text-ink">{HEADLINES[5]}</h3>
              <p className="mx-auto mt-3 max-w-[36rem] text-[0.82rem] leading-[1.6] text-ink/75 md:mx-0">{f.quote}</p>
            </Bubble>
            <div className="mt-5 flex items-center justify-center gap-3 md:ml-6 md:justify-start">
              <Avatar t={f} size="md" />
              <Byline t={f} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------- building blocks ---------- */

function Reveal({ children, reduced, delay, className = '' }: { children: ReactNode; reduced: boolean; delay: number; className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.9, ease: LUX, delay }}
    >
      {children}
    </motion.div>
  )
}

const CARD =
  'relative rounded-2xl bg-white p-5 shadow-[0_10px_30px_-12px_rgba(42,15,18,0.18),0_1px_2px_rgba(42,15,18,0.06)] ring-1 ring-ink/5 md:p-5'

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${CARD} ${className}`}>{children}</div>
}

/** A card with a small triangular tail on its bottom edge. */
function Bubble({ children, tail, className = '' }: { children: ReactNode; tail: 'left' | 'right'; className?: string }) {
  return (
    <div className={`${CARD} ${className}`}>
      {children}
      <span
        aria-hidden="true"
        className={`absolute -bottom-2 h-5 w-5 rotate-45 rounded-[3px] bg-white ring-1 ring-ink/5 [clip-path:polygon(0_100%,100%_100%,100%_0)] ${
          tail === 'right' ? 'right-[3.75rem]' : 'left-8'
        }`}
      />
    </div>
  )
}

const AVATAR = { sm: 'h-9 w-9', md: 'h-12 w-12', lg: 'h-14 w-14' } as const

function Avatar({ t, size, className = '' }: { t: T; size: keyof typeof AVATAR; className?: string }) {
  return (
    <img
      src={t.image}
      {...responsive(t.image, '96px')}
      alt={`${t.name}, ${t.role}`}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`${AVATAR[size]} select-none rounded-full object-cover object-[50%_20%] shadow-[0_6px_18px_-6px_rgba(42,15,18,0.35)] ring-[3px] ring-white ${className}`}
    />
  )
}

function Byline({ t, className = '' }: { t: T; className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-[0.76rem] font-semibold text-ink">{t.name}</span>
      <span className="text-[0.62rem] uppercase tracking-[0.22em] text-muted">{t.role}</span>
    </div>
  )
}

function Stars({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className}`} aria-label="Rated 5 out of 5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" className="fill-[#e0b23a]">
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
        </svg>
      ))}
    </div>
  )
}

function QuoteMark() {
  return (
    <span aria-hidden="true" className="block select-none font-display text-[3rem] leading-[0.6] text-ink">
      &ldquo;
    </span>
  )
}
