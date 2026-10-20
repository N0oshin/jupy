import { useReducedMotion } from '../../lib/useReducedMotion'

/* Phrases that scroll continuously across the band. */
const PHRASES = [
  'Research-grade peptides',
  'HPLC-verified purity',
  'Pharmaceutical precision',
  'Independently certified',
]

export default function Marquee() {
  const reduced = useReducedMotion()
  // The track translates by -50% to loop, so each half must be wider than the
  // viewport: four runs per half (~6000px at this type size) covers any monitor.
  const half = Array.from({ length: 4 }, () => PHRASES).flat()
  const items = [...half, ...half]

  return (
    <section
      id="marquee"
      aria-label="Research-grade peptides. HPLC-verified purity. Pharmaceutical precision. Independently certified."
      /* Was py-24 sm:py-32 lg:py-72 — 288px of padding per edge on desktop made
         this decorative band taller than most real content sections. */
      className="relative isolate overflow-hidden py-5 sm:py-6 lg:py-8"
    >
      {/* Dusty-blue band with a soft grain; replaces the old blurred photo. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue via-[#c3d4df] to-blue" />
      <div className="absolute inset-0 -z-10 grain opacity-10" />

      <div className="group flex overflow-hidden" data-cursor>
        <div
          className="flex shrink-0 animate-marquee items-center whitespace-nowrap"
          style={{
            animationDuration: '60s',
            animationPlayState: reduced ? 'paused' : 'running',
          }}
        >
          {items.map((p, i) => (
            <span
              key={i}
              className="mx-6 inline-flex items-center gap-6 font-sans text-[clamp(0.8rem,1.5vw,1.15rem)] font-medium uppercase leading-none tracking-[0.22em] text-accent-dark lg:mx-8 lg:gap-8"
            >
              {p}
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ink/60" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
