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
  // Doubled so the -50% translate loops seamlessly.
  const items = [...PHRASES, ...PHRASES]

  return (
    <section
      id="marquee"
      aria-label="Research-grade peptides. HPLC-verified purity. Pharmaceutical precision. Independently certified."
      /* Was py-24 sm:py-32 lg:py-72 — 288px of padding per edge on desktop made
         this decorative band taller than most real content sections. */
      className="relative overflow-hidden py-16 sm:py-24 lg:py-40"
    >
      {/* Saved background image — heavily blurred */}
      <img
        src="/images/jupyter-labs-blur-backdrop.webp"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full scale-125 object-cover blur-[48px]"
      />
      <div className="absolute inset-0 -z-10 bg-accent-dark/25" />
      <div className="absolute inset-0 -z-10 grain opacity-15" />

      <div className="group flex overflow-hidden" data-cursor>
        <div
          className="flex shrink-0 animate-marquee items-center whitespace-nowrap"
          style={{
            animationDuration: '34s',
            animationPlayState: reduced ? 'paused' : 'running',
          }}
        >
          {items.map((p, i) => (
            <span
              key={i}
              className="mx-8 font-display text-[clamp(2.25rem,7vw,5.5rem)] font-light leading-none text-white/90 drop-shadow-[0_2px_20px_rgba(0,0,0,0.22)] lg:mx-12"
            >
              {p}
              <span className="text-gold">.</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
