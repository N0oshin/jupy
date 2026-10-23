import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TESTIMONIALS } from '../../lib/content'
import { responsive } from '../../lib/responsiveImage'
import { useReducedMotion } from '../../lib/useReducedMotion'

type T = (typeof TESTIMONIALS)[number]

const LUX = [0.16, 1, 0.3, 1] as const
/** How long each review stays up before the next one fades in. */
const DWELL_MS = 3000

/**
 * Testimonials — one review at a time, no cards. The reviewer's photo sits on
 * the left, softly fading into the page; on the right a thin, widely tracked
 * "TESTIMONIALS" heading, a large quote mark, the review in plain text and the
 * reviewer's name as a small tracked caption. Reviews cross-fade on a timer
 * and can be stepped with the arrows or the dots.
 */
export default function Testimonials() {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = TESTIMONIALS.length
  const t = TESTIMONIALS[index]

  const go = useCallback((dir: 1 | -1) => setIndex((i) => (i + dir + n) % n), [n])

  useEffect(() => {
    if (reduced || paused) return
    const id = window.setInterval(() => go(1), DWELL_MS)
    return () => window.clearInterval(id)
  }, [go, paused, reduced])

  return (
    <section
      id="testimonials"
      aria-label="Testimonials"
      className="relative overflow-hidden bg-[#fdfcf8] py-10 lg:py-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
      }}
    >
      <div className="container-x grid items-center justify-center gap-10 md:grid-cols-[auto_minmax(0,38rem)] md:gap-6 lg:gap-8">
        {/* Photo. A still, uneven amoeba outline; the mask then fades the
            text-side and bottom edges into the page so it sits on the
            section rather than in a frame. */}
        <div className="relative mx-auto w-[16rem] md:mx-0 md:-mr-10 md:w-[20rem] lg:-mr-12">
          <div
            className="relative aspect-[4/5] overflow-hidden border-0 outline-none ring-0"
            style={{
              borderRadius: PHOTO_SHAPE,
              maskImage: PHOTO_MASK,
              WebkitMaskImage: PHOTO_MASK,
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in',
            }}
          >
            <AnimatePresence initial={false}>
              <motion.img
                key={t.image}
                src={t.image}
                {...responsive(t.image, '(min-width: 768px) 320px, 256px')}
                alt={`${t.name}, ${t.role}`}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="absolute inset-0 h-full w-full select-none object-cover object-[50%_20%]"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 1.1, ease: LUX }}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Copy. Sits above the photo's faded edge where the two overlap. */}
        <div className="relative z-10">
          <h2 className="font-display text-[clamp(1.5rem,1rem+2vw,2.5rem)] font-extralight uppercase leading-none tracking-[0.22em] text-accent-dark/80 md:-mt-10 md:ml-10 lg:-mt-14 lg:ml-14">
            Testimonials
          </h2>

          <div className="relative mt-8 flex gap-5 md:mt-10 md:gap-7">
            <span
              aria-hidden="true"
              className="-mt-3 shrink-0 select-none font-display text-[5rem] font-light leading-none text-accent/60 md:text-[6.5rem]"
            >
              &ldquo;
            </span>
            <div className="min-h-[9rem] flex-1 md:min-h-[8rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.figure
                  key={index}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.7, ease: LUX }}
                >
                  <blockquote className="max-w-[34rem] text-[0.95rem] leading-[1.7] text-ink/85 text-pretty md:text-base">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-6 text-[0.62rem] uppercase tracking-[0.3em] text-muted">
                    &mdash; {t.name}
                    <span className="mx-2 text-muted/40">·</span>
                    {t.role}
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>

          {/* Arrows and dots. */}
          <div className="mt-8 flex items-center justify-center gap-6 md:mt-10">
           
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose a review">
              {TESTIMONIALS.map((x, i) => (
                <button
                  key={x.name}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Review ${i + 1} of ${n}, ${x.name}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-[width,background-color] duration-[600ms] ease-[var(--ease-lux)] ${
                    i === index ? 'w-6 bg-accent-dark' : 'w-1.5 bg-ink/25 hover:bg-ink/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Asymmetric, organic outline for the photo. Static: it does not drift. */
const PHOTO_SHAPE = '62% 38% 56% 44% / 48% 58% 42% 52%'

/* The fade on the text side starts well inside the photo, so the edge melts
   into the page under the copy rather than stopping at a line. */
const PHOTO_MASK =
  'linear-gradient(to right, #000 40%, rgba(0,0,0,0.55) 68%, transparent 100%), linear-gradient(to bottom, #000 72%, transparent 100%)'

function Arrow({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 1 ? 'Next review' : 'Previous review'}
      className="grid h-9 w-9 place-items-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-accent-dark hover:text-accent-dark"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ transform: dir === 1 ? undefined : 'scaleX(-1)' }}>
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
