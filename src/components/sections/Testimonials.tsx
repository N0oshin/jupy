import Heading from '../ui/Heading'
import { TESTIMONIALS } from '../../lib/content'
import { useReducedMotion } from '../../lib/useReducedMotion'

type T = (typeof TESTIMONIALS)[number]

function Quote({ t }: { t: T }) {
  return (
    <figure className="group relative mx-3 flex w-[22rem] shrink-0 flex-col justify-between overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-card p-8 transition-all duration-500 hover:-translate-y-1 hover:border-accent-dark/30 hover:shadow-[0_20px_60px_-30px_rgba(15,118,110,0.45)] sm:w-[26rem]">
      {/* Background portrait — fades in on hover. Lazy: these sit in an offscreen
          marquee and are invisible until hover, so eager-loading six 600px
          portraits only stole bandwidth from the hero. */}
      <img
        src={t.image}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        loading="lazy"
        decoding="async"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/65 to-card/15 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative">
        <div className="flex gap-1 text-gold">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 1l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8 4.8 17.1l1-5.8L1.5 7.2l5.9-.9L10 1z" />
            </svg>
          ))}
        </div>
        <blockquote className="mt-5 font-display text-base font-normal leading-[1.5] text-ink lg:text-lg">“{t.quote}”</blockquote>
      </div>
      <figcaption className="relative mt-7 flex items-center gap-3">
        <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-accent-dark font-serif text-bg">
          <span className="transition-opacity duration-500 group-hover:opacity-0">{t.name.charAt(0)}</span>
          <img
            src={t.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            loading="lazy"
            decoding="async"
          />
        </span>
        <span>
          <span className="block font-medium text-ink">{t.name}</span>
          <span className="block text-sm text-muted">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  )
}

function Row({ items, reverse, paused }: { items: T[]; reverse?: boolean; paused: boolean }) {
  const doubled = [...items, ...items]
  return (
    <div className="group flex overflow-hidden" data-cursor>
      <div
        className="flex shrink-0 animate-marquee"
        style={{
          animationDuration: '46s',
          animationDirection: reverse ? 'reverse' : 'normal',
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {doubled.map((t, i) => (
          <Quote key={i} t={t} />
        ))}
      </div>
    </div>
  )
}

export default function Testimonials() {
  const reduced = useReducedMotion()
  return (
    <section id="testimonials" className="section-pad relative overflow-hidden bg-bg">
      <div className="container-x mb-16">
        <Heading
          eyebrow="From The Bench"
          title={'Trusted by labs that\nread the certificate.'}
          intro="What research buyers, analytical chemists and QA teams say about the documentation, purity verification and service."
        />
      </div>

      <div className="relative flex flex-col gap-6">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />

        <Row items={TESTIMONIALS.slice(0, 3)} paused={reduced} />
        <Row items={TESTIMONIALS.slice(3)} reverse paused={reduced} />
      </div>
    </section>
  )
}
