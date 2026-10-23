import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'

/**
 * Why Us — the four things the supplier does that the Difference and Craft
 * sections above do not already cover (the origin story itself now lives on
 * /about),
 * laid out like a product call-out diagram: one pen standing in the centre,
 * leader lines running out to each standard. On scroll the lines draw and the
 * copy types in, one call-out after another.
 */


type Side = 'left' | 'right'

interface Callout {
  n: string
  t: string
  d: string
  side: Side
  /** leader line length on desktop, as a tailwind width class */
  line: string
}

/** Desktop grid slots for CALLOUTS, by index: left/right of the pen, top/bottom rows. */
const PLACEMENT = [
  'lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:self-start lg:mt-[3.25rem] xl:translate-x-6',
  'lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-start lg:mt-[7rem] xl:-translate-x-6',
  'lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-end lg:mb-[4.5rem] xl:translate-x-6',
  'lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:self-end lg:mb-3 xl:-translate-x-6',
]

const CALLOUTS: Callout[] = [
  { n: '01', t: 'A batch you can look up', d: 'Every pen is tied to a lot number, and the certificate for that lot is yours on request.', side: 'left', line: 'lg:w-20 xl:w-24' },
  { n: '02', t: 'A person who answers', d: 'A real reply, from someone who knows which batch is on the shelf today.', side: 'right', line: 'lg:w-24 xl:w-36' },
  { n: '03', t: 'Cold from fill to courier', d: 'Held at 2–8 °C and tamper-sealed from the moment a pen is filled until it is scanned out.', side: 'left', line: 'lg:w-28 xl:w-40' },
  { n: '04', t: 'Six compounds, not sixty', d: 'A deliberately short range, stocked in the doses researchers actually ask for.', side: 'right', line: 'lg:w-16 xl:w-24' },
]

/** Text that is typed in by the section timeline. A ghost copy reserves the layout. */
function Typed({ text, className = '', reduced }: { text: string; className?: string; reduced: boolean }) {
  if (reduced) return <span className={className}>{text}</span>
  return (
    <span className={`relative block ${className}`}>
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      <span className="why-type absolute inset-0" data-full={text} aria-label={text} />
    </span>
  )
}

export default function WhyChoose() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced) return

      // Pen: slow float + a touch of scroll parallax.
      gsap.to('.why-pen', { y: -10, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to('.why-pen-wrap', {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: '.why-diagram', start: 'top bottom', end: 'bottom top', scrub: true },
      })

      // Call-outs: dot pops, line draws, then the copy types — one after another.
      const items = gsap.utils
        .toArray<HTMLElement>('.why-callout')
        .sort((a, b) => Number(a.dataset.n) - Number(b.dataset.n))
      gsap.set('.why-dot', { scale: 0 })
      gsap.set('.why-line', { scaleX: 0 })
      gsap.set('.why-ring', { scale: 0.4, opacity: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: '.why-diagram', start: 'top 72%', once: true },
      })

      items.forEach((item) => {
        const dot = item.querySelector('.why-dot')
        const ring = item.querySelector('.why-ring')
        const line = item.querySelector('.why-line')
        const typed = Array.from(item.querySelectorAll<HTMLElement>('.why-type'))

        tl.to(dot, { scale: 1, duration: 0.3, ease: 'back.out(3)' })
          .to(ring, { scale: 1.6, opacity: 0, duration: 0.8, ease: 'power1.out' }, '<')
          .to(line, { scaleX: 1, duration: 0.4, ease: 'power3.inOut' }, '<0.1')

        typed.forEach((el) => {
          const full = el.dataset.full ?? ''
          const state = { n: 0 }
          tl.to(state, {
            n: full.length,
            duration: Math.min(0.9, 0.2 + full.length * 0.008),
            ease: 'none',
            snap: { n: 1 },
            onStart: () => el.classList.add('is-typing'),
            onUpdate: () => {
              el.textContent = full.slice(0, state.n)
            },
            onComplete: () => {
              el.textContent = full
              el.classList.remove('is-typing')
            },
          })
        })

        tl.to({}, { duration: 0.08 })
      })
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section id="why" ref={ref} className="relative overflow-hidden">
      {/* ───── DIAGRAM + FOOTNOTE — dark field ───── */}
      <div className="section-pad relative bg-ink text-bg">
      {/* Warm tonal field — deep brown / red shades already in the palette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 50% 50%, rgba(121,13,22,0.42) 0%, rgba(121,13,22,0) 70%), radial-gradient(45% 40% at 12% 8%, rgba(154,37,48,0.22) 0%, rgba(154,37,48,0) 70%), linear-gradient(180deg, #2a0f12 0%, #341314 50%, #2a0f12 100%)',
        }}
      />
      {/* faint grain for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="container-x relative">
        {/* ───── DIAGRAM: pen + call-outs ───── */}
        <div className="why-diagram">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.56rem] uppercase tracking-[0.3em] text-bg/55">What we don't skip</p>
            <h3 className="mt-2.5 font-display text-[clamp(1.4rem,1rem+1.9vw,2.3rem)] font-medium leading-[1.05] tracking-[-0.015em] text-bg">
              The parts most suppliers leave out.
            </h3>
          </div>

          <div className="relative mt-10 grid items-center gap-8 lg:mt-12 lg:grid-cols-12 lg:grid-rows-2 lg:gap-0">
            {/* Pen — first in DOM on mobile, centre column on desktop */}
            <div className="why-pen-wrap relative order-first mx-auto pt-4 lg:order-none lg:pt-10 lg:col-span-2 lg:col-start-6 lg:row-span-2 lg:row-start-1">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[21rem] w-[21rem] -translate-x-1/2 -translate-y-1/2 rounded-full lg:h-[29rem] lg:w-[29rem]"
                style={{ background: 'radial-gradient(closest-side, rgba(229,211,175,0.22), rgba(229,211,175,0) 70%)' }}
              />
              <div className="why-pen relative mx-auto h-[18rem] w-[3.6rem] sm:h-[21rem] lg:h-[27rem] lg:w-[4.8rem]">
                <img
                  src="/images/products/pens/tirzepatide.webp"
                  alt="Alluvi Tirzepatide pen, standing upright"
                  width={900}
                  height={148}
                  loading="lazy"
                  decoding="async"
                  className="absolute left-1/2 top-1/2 h-auto w-[18rem] max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90 drop-shadow-[0_24px_32px_rgba(0,0,0,0.55)] sm:w-[21rem] lg:w-[27rem]"
                />
              </div>
            </div>

            {/* Call-outs, in reading order on mobile; pinned around the pen on desktop */}
            {CALLOUTS.map((c, i) => (
              <CalloutItem key={c.n} c={c} reduced={reduced} className={PLACEMENT[i]} />
            ))}
          </div>
        </div>

      </div>
      </div>
    </section>
  )
}

function CalloutItem({ c, reduced, className = '' }: { c: Callout; reduced: boolean; className?: string }) {
  const left = c.side === 'left'
  return (
    <div
      data-n={c.n}
      className={`why-callout flex items-start gap-3.5 ${left ? 'lg:flex-row-reverse lg:text-right' : ''} ${className}`}
    >
      {/* leader: dot at the pen end, line running out to the copy */}
      <div className={`relative mt-2 flex shrink-0 items-center ${left ? 'lg:flex-row-reverse' : ''}`}>
        <span className="relative block h-2.5 w-2.5">
          <span className="why-ring absolute inset-0 rounded-full border border-sand/70" />
          <span className="why-dot absolute inset-0 rounded-full bg-sand shadow-[0_0_12px_rgba(229,211,175,0.8)]" />
        </span>
        <span
          className={`why-line block h-px w-10 bg-gradient-to-r from-sand/80 to-sand/30 ${c.line} ${
            left ? 'origin-right lg:bg-gradient-to-l' : 'origin-left'
          }`}
        />
      </div>

      <div className="min-w-0 flex-1 lg:flex-none lg:max-w-[16rem]">
        <p className="font-display text-[0.7rem] font-medium text-sand">{c.n}</p>
        <h4 className="mt-1 font-display text-[clamp(1rem,0.88rem+0.5vw,1.2rem)] font-medium leading-[1.1] tracking-[-0.015em] text-bg">
          <Typed text={c.t} reduced={reduced} />
        </h4>
        <p className="mt-1.5 text-[0.8rem] leading-[1.5] text-bg/70">
          <Typed text={c.d} reduced={reduced} />
        </p>
      </div>
    </div>
  )
}
