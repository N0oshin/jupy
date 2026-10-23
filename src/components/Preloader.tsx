import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Botanicals from './Botanicals'

const EASE = [0.16, 1, 0.3, 1] as const

/** Total sweep of the counter, and the curtain lift that follows it. */
const COUNT_MS = 600
const EXIT_S = 0.4

const SEEN_KEY = 'jl:intro-seen'

/**
 * Cinematic entrance: counter sweep + curtain reveal, then unmounts.
 *
 * The intro gates LCP — nothing behind an opaque overlay can paint — so it is
 * kept deliberately short, and skipped entirely for repeat visits within the
 * session and for users who prefer reduced motion.
 *
 * The counter is driven straight to the DOM through refs rather than through
 * React state: at 60fps a state-backed counter would re-render this tree on
 * every frame of the page's most contended moment.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  // Decided synchronously, before first paint, so a skipped intro never flashes.
  const [skip] = useState(
    () =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      sessionStorage.getItem(SEEN_KEY) === '1',
  )
  const [open, setOpen] = useState(!skip)

  const pctRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // Held in a ref so the rAF sweep below never re-runs just because the parent
  // handed down a new callback identity. Synced in an effect rather than during
  // render — writing to a ref while rendering is not safe under concurrent React.
  const doneRef = useRef(onDone)
  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (skip) {
      doneRef.current()
      return
    }
    sessionStorage.setItem(SEEN_KEY, '1')

    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / COUNT_MS)
      const eased = Math.round((1 - Math.pow(1 - p, 3)) * 100)
      if (pctRef.current) pctRef.current.textContent = `${eased}%`
      if (barRef.current) barRef.current.style.width = `${eased}%`
      if (p < 1) raf = requestAnimationFrame(tick)
      else setOpen(false)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [skip])

  return (
    <AnimatePresence onExitComplete={() => doneRef.current()}>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg text-accent-dark"
          exit={{ y: '-100%' }}
          transition={{ duration: EXIT_S, ease: EASE }}
          role="status"
          aria-live="polite"
          aria-label="Loading Jupyter Labs"
        >
          <Botanicals />
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative z-10 overflow-hidden"
          >
            <span className="inline-flex items-center gap-4 font-display leading-none">
              <span
                className="text-[14vw] font-medium lowercase tracking-[-0.015em] sm:text-[7rem]"
                style={{ fontFeatureSettings: '"ss01", "cv01"' }}
              >
                <span className="italic text-accent-dark">j</span>upyter
              </span>
              <span className="h-[7vw] w-px bg-accent-dark/50 sm:h-[3.5rem]" />
              <span className="text-[1.4vw] font-medium uppercase tracking-[0.34em] text-accent-dark sm:text-[0.7rem]">
                Labs
              </span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.3 }}
            className="relative z-10 mt-6 flex w-[min(78vw,420px)] items-center justify-between text-xs uppercase tracking-[0.3em] text-accent-dark/70"
          >
            <span>Elevate Daily Wellness</span>
            <span ref={pctRef} className="tabular-nums">
              0%
            </span>
          </motion.div>

          <div className="relative z-10 mt-3 h-px w-[min(78vw,420px)] overflow-hidden bg-accent-dark/15">
            <div ref={barRef} className="h-full w-0 bg-accent-dark" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
