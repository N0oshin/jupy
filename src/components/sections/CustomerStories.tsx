import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { responsive } from '../../lib/responsiveImage'
import { useReducedMotion } from '../../lib/useReducedMotion'

/**
 * Customer Stories — a centre-stage carousel. The active customer is shown as
 * a pair: a white card carrying a bold one-line takeaway and their quote, and
 * a tall photo card beside it. The other customers wait either side as small
 * portrait cards that shrink and fade with distance, and when one is chosen
 * its card slides and grows into the featured slot. Advances on its own,
 * pauses while hovered or focused, and stops entirely under reduced motion.
 */

interface Story {
  name: string
  headline: string
  quote: string
  image: string
}

const STORIES: Story[] = [
  {
    name: 'Mei Tanaka',
    headline: 'Eleven kilos in five months.',
    quote:
      "I started tirzepatide in January and the constant snacking just switched off within a couple of weeks. Eleven kilos down by June, and more than that, I'm not thinking about food all day. The pen is easy, and the box always arrives cold.",
    image: '/images/customers/mei.webp',
  },
  {
    name: 'Charlotte Reyes',
    headline: 'Afternoons without the crash.',
    quote:
      "I bought the NAD+ pen because I was dragging myself through every afternoon. Four weeks in, the 3pm slump is mostly gone and I'm not reaching for a third coffee. Not a miracle, just steadier energy, which is what I wanted.",
    image: '/images/customers/charlotte.webp',
  },
  {
    name: 'Elena Kovač',
    headline: 'My skin looks rested. People noticed.',
    quote:
      "Two months on the Glow pen and the difference is in my photos. Fine lines around my eyes are softer and my skin looks less tired in the mornings. A colleague asked if I'd been on holiday. I hadn't.",
    image: '/images/customers/elena.webp',
  },
  {
    name: 'Hannah Weiss',
    headline: 'Back to running after a year off.',
    quote:
      "A shoulder and knee that never quite healed kept me off the trails. I tried the BPC-157 and TB-500 set after a friend recommended it, and by week six I was running pain-free three mornings a week. I'm being careful, but I'm out there again.",
    image: '/images/customers/hannah.webp',
  },
  {
    name: 'Isabel Moreau',
    headline: 'Sleeping through the night again.',
    quote:
      "I'd wake at 3am most nights for years. Since starting CJC-1295 I'm sleeping straight through and waking up before my alarm feeling actually rested. My partner says I've stopped tossing. That alone was worth it.",
    image: '/images/customers/isabel.webp',
  },
  {
    name: 'Yasmin Haddad',
    headline: 'The stubborn middle finally moved.',
    quote:
      "Diet and the gym had done nothing for the weight around my waist for two years. Three months of tesamorelin and I'm two notches in on my belt. The first few weeks were slow and I nearly gave up, so stick with it.",
    image: '/images/customers/yasmin.webp',
  },
  {
    name: 'Tomás Ferreira',
    headline: 'Recovering faster than I did at 25.',
    quote:
      "I'm 34 and was sore for days after every session. Since adding MOTS-C I'm training five days a week and the next-day stiffness is mostly gone. I compared certificates before buying and the purity matched what was on the box.",
    image: '/images/customers/tomas.webp',
  },
]

const N = STORIES.length
const AUTOPLAY_MS = 4000
const LUX = [0.16, 1, 0.3, 1] as const

/* ---------- stage geometry (px) ---------- */

interface Layout {
  text: [number, number]
  photo: [number, number]
  /** side cards by distance from the active one; anything further is hidden */
  sides: [number, number][]
  gap: number
  sideGap: number
}

const LAYOUTS: Record<'lg' | 'md', Layout> = {
  lg: { text: [352, 416], photo: [304, 416], sides: [[136, 256], [104, 192]], gap: 16, sideGap: 14 },
  md: { text: [292, 384], photo: [236, 384], sides: [[104, 196]], gap: 14, sideGap: 12 },
}

type Bp = 'lg' | 'md' | 'sm'

const QUERIES: [Bp, string][] = [
  ['lg', '(min-width: 1024px)'],
  ['md', '(min-width: 768px)'],
]

function subscribe(cb: () => void) {
  const lists = QUERIES.map(([, q]) => window.matchMedia(q))
  lists.forEach((l) => l.addEventListener('change', cb))
  return () => lists.forEach((l) => l.removeEventListener('change', cb))
}

function readBp(): Bp {
  for (const [bp, q] of QUERIES) if (window.matchMedia(q).matches) return bp
  return 'sm'
}

function useBreakpoint(): Bp {
  return useSyncExternalStore(subscribe, readBp, () => 'sm')
}

/** Signed distance from the active slide, wrapped so the ring is symmetric. */
function offsetOf(i: number, active: number) {
  const half = Math.floor(N / 2)
  return ((i - active + N + half) % N) - half
}

interface Slot {
  /** centre x, relative to the stage centre */
  x: number
  w: number
  h: number
  opacity: number
  visible: boolean
}

/** The centre x of the featured text card. */
function textCentre(L: Layout) {
  const [tw] = L.text
  const [pw] = L.photo
  return -(tw + L.gap + pw) / 2 + tw / 2
}

/** Where slide `i` sits for a given active index; slides beyond the visible ring park off-stage. */
function slotFor(L: Layout, i: number, active: number): Slot {
  const [tw] = L.text
  const [pw, ph] = L.photo
  const left = -(tw + L.gap + pw) / 2
  const right = left + tw + L.gap + pw

  const d = offsetOf(i, active)
  if (d === 0) return { x: right - pw / 2, w: pw, h: ph, opacity: 1, visible: true }

  const dir = Math.sign(d)
  const k = Math.abs(d)
  const side = L.sides[k - 1]
  if (!side) {
    const far = right + L.sides.reduce((s, [w]) => s + w + L.sideGap, 0)
    return { x: dir * far, w: 48, h: 96, opacity: 0, visible: false }
  }

  // Walk outwards from the pair's edge, card by card, to this one's centre.
  let edge = dir > 0 ? right : left
  for (let j = 0; j < k - 1; j++) edge += dir * (L.sideGap + L.sides[j][0])
  const x = edge + dir * (L.sideGap + side[0] / 2)
  return { x, w: side[0], h: side[1], opacity: k === 1 ? 0.92 : 0.72, visible: true }
}

export default function CustomerStories() {
  const reduced = useReducedMotion()
  const bp = useBreakpoint()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  const go = useCallback((i: number) => setActive(((i % N) + N) % N), [])
  const next = useCallback(() => setActive((a) => (a + 1) % N), [])
  const prev = useCallback(() => setActive((a) => (a - 1 + N) % N), [])

  // Autoplay: only while on screen, not hovered/focused, and motion is allowed.
  useEffect(() => {
    if (reduced || paused) return
    const el = stageRef.current
    if (!el) return
    let timer: number | undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer)
        if (entry.isIntersecting) timer = window.setInterval(next, AUTOPLAY_MS)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearInterval(timer)
    }
  }, [reduced, paused, next])

  const story = STORIES[active]
  const spring = reduced ? { duration: 0 } : { type: 'spring' as const, stiffness: 170, damping: 26, mass: 0.9 }

  return (
    <section id="customer-stories" aria-label="Customer stories" className="relative overflow-hidden">
      {/* Soft tonal field in the brand palette: cream into dusty blue into a blush of burgundy. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 0%, rgba(174,196,212,0.55) 0%, rgba(174,196,212,0) 70%), radial-gradient(55% 50% at 85% 95%, rgba(154,37,48,0.16) 0%, rgba(154,37,48,0) 70%), radial-gradient(50% 45% at 10% 90%, rgba(229,211,175,0.7) 0%, rgba(229,211,175,0) 70%), linear-gradient(180deg, #f7f4ec 0%, #f1ece0 100%)',
        }}
      />

      <div className="container-x section-pad relative">
        <header className="mx-auto max-w-xl text-center">
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-accent-dark/80">Customer stories</p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,1.2rem+2.2vw,2.75rem)] font-light leading-tight text-ink">
            Real customers. Real orders.
          </h2>
        </header>

        <div
          ref={stageRef}
          className="relative mt-10 md:mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {bp === 'sm' ? (
            <Stacked story={story} reduced={reduced} />
          ) : (
            <Stage layout={LAYOUTS[bp]} active={active} story={story} reduced={reduced} spring={spring} onPick={go} />
          )}

          {/* Controls: arrows either side, one dot per customer. */}
          <div className="mt-8 flex items-center justify-center gap-5">
            <ArrowButton dir="prev" onClick={prev} />
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose a customer">
              {STORIES.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={s.name}
                  onClick={() => go(i)}
                  className="group p-1"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-500 ease-[var(--ease-lux)] ${
                      i === active ? 'w-6 bg-accent-dark' : 'w-1.5 bg-ink/25 group-hover:bg-ink/50'
                    }`}
                  />
                </button>
              ))}
            </div>
            <ArrowButton dir="next" onClick={next} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- desktop / tablet stage ---------- */

function Stage({
  layout,
  active,
  story,
  reduced,
  spring,
  onPick,
}: {
  layout: Layout
  active: number
  story: Story
  reduced: boolean
  spring: object
  onPick: (i: number) => void
}) {
  const [tw, th] = layout.text

  return (
    <div className="relative mx-auto" style={{ height: th }}>
      {/* Featured text card: fixed in the left half of the pair. */}
      <motion.div
        className="absolute left-1/2 top-0 overflow-hidden rounded-[1.4rem] bg-white shadow-[0_24px_60px_-28px_rgba(42,15,18,0.35),0_1px_2px_rgba(42,15,18,0.06)] ring-1 ring-ink/5"
        style={{ width: tw, height: th, marginLeft: -tw / 2 }}
        animate={{ x: textCentre(layout) }}
        transition={spring}
      >
        <TextCard story={story} reduced={reduced} />
      </motion.div>

      {/* Every photo card, sliding into place around the pair. */}
      {STORIES.map((s, i) => {
        const p = slotFor(layout, i, active)
        const isActive = i === active
        return (
          <motion.button
            key={s.name}
            type="button"
            aria-label={isActive ? undefined : `Show ${s.name}'s story`}
            aria-hidden={!p.visible}
            tabIndex={isActive || !p.visible ? -1 : 0}
            disabled={isActive}
            onClick={() => onPick(i)}
            className={`absolute left-1/2 top-1/2 overflow-hidden rounded-[1.4rem] bg-section shadow-[0_24px_60px_-28px_rgba(42,15,18,0.4)] ring-1 ring-ink/5 ${
              isActive ? 'cursor-default' : 'cursor-pointer'
            } ${p.visible ? '' : 'pointer-events-none'}`}
            style={{ zIndex: isActive ? 2 : 1, translateY: '-50%' }}
            initial={false}
            animate={{ x: p.x - p.w / 2, width: p.w, height: p.h, opacity: p.opacity }}
            transition={spring}
            whileHover={isActive || reduced ? undefined : { opacity: 1, scale: 1.03 }}
          >
            <img
              src={s.image}
              {...responsive(s.image, isActive ? '320px' : '140px')}
              alt={s.name}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="h-full w-full select-none object-cover object-[50%_18%]"
            />
          </motion.button>
        )
      })}
    </div>
  )
}

/* ---------- mobile: the pair, stacked ---------- */

function Stacked({ story, reduced }: { story: Story; reduced: boolean }) {
  return (
    <div className="mx-auto max-w-[24rem]">
      <div className="overflow-hidden rounded-[1.4rem] bg-white shadow-[0_24px_60px_-28px_rgba(42,15,18,0.35)] ring-1 ring-ink/5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={story.name}
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease: LUX }}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-section">
              <img
                src={story.image}
                {...responsive(story.image, '(min-width: 480px) 384px, 100vw')}
                alt={story.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-[50%_18%]"
              />
            </div>
            <div className="p-5">
              <h3 className="font-display text-[1.35rem] font-semibold leading-[1.15] tracking-[-0.01em] text-ink">{story.headline}</h3>
              <p className="mt-3 text-[0.84rem] leading-[1.6] text-ink/75">&ldquo;{story.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-8 bg-accent-dark/60" />
                <span className="text-[0.82rem] font-semibold text-ink">{story.name}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------- pieces ---------- */

function TextCard({ story, reduced }: { story: Story; reduced: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={story.name}
        className="flex h-full flex-col p-6 lg:p-7"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: -10 }}
        transition={{ duration: 0.45, ease: LUX }}
      >
        <h3 className="font-display text-[clamp(1.3rem,1rem+0.9vw,1.75rem)] font-semibold leading-[1.12] tracking-[-0.015em] text-ink">
          {story.headline}
        </h3>
        <p className="mt-4 font-serif text-[0.98rem] italic leading-[1.5] text-ink/80 lg:text-[1.1rem] lg:leading-[1.55]" aria-live="polite">
          &ldquo;{story.quote}&rdquo;
        </p>
        <div className="mt-auto flex items-center gap-3 pt-5">
          <span aria-hidden="true" className="h-px w-8 bg-accent-dark/60" />
          <span className="text-[0.82rem] font-semibold text-ink">{story.name}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function ArrowButton({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous customer' : 'Next customer'}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-ink ring-1 ring-ink/10 backdrop-blur transition-colors duration-300 hover:bg-white hover:ring-accent-dark/40"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dir === 'prev' ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  )
}
