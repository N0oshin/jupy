import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CtaLink from './ui/CtaLink'
import { responsive } from '../lib/responsiveImage'
import { useReducedMotion } from '../lib/useReducedMotion'

/** How long after the page is ready (preloader done) the popup appears. */
const DELAY_MS = 4000
const SEEN_KEY = 'jl:partner-seen'
const PHOTO = '/images/ecom/standard-tirzepatide.webp'
const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Official-partner popup: a two-panel dialog (photo left, copy right) that
 * slides up a few seconds after the homepage is ready. Once dismissed it stays
 * away for the rest of the tab's session;
 * closes on the X, the backdrop, or Escape. Body scroll (and Lenis) is paused
 * while it is open, and focus moves into the dialog and back out again.
 */
export default function PartnerPopup({ ready }: { ready: boolean }) {
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnRef = useRef<HTMLElement | null>(null)

  // Arm the timer once the preloader has lifted; skip repeat visits in the session.
  useEffect(() => {
    // if (!ready || sessionStorage.getItem(SEEN_KEY) === '1') return
    const id = window.setTimeout(() => setOpen(true), DELAY_MS)
    return () => window.clearTimeout(id)
  }, [ready])

  // While open: freeze scrolling, trap focus on the dialog, close on Escape.
  useEffect(() => {
    if (!open) return
    returnRef.current = document.activeElement as HTMLElement | null
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis
    lenis?.stop()
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sessionStorage.setItem(SEEN_KEY, '1')
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      lenis?.start()
      returnRef.current?.focus?.()
    }
  }, [open])

  // The "seen" flag is set on dismiss, not on open: a reload before closing
  // shows it again, and it stays away for the rest of the tab's session after.
  const close = () => {
    sessionStorage.setItem(SEEN_KEY, '1')
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="partner-popup"
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.4 }}
        >
          {/* Backdrop: dims and softens the page behind. */}
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 cursor-default bg-ink/60 backdrop-blur-[6px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-popup-title"
            className="relative grid w-full max-w-[60rem] overflow-hidden rounded-[1.5rem] bg-[#3a1216] text-bg shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/10 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
            initial={reduced ? false : { opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.25 } }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {/* Warm tonal field, same family as the "What we don't skip" section. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(60% 55% at 20% 100%, rgba(121,13,22,0.55) 0%, rgba(121,13,22,0) 70%), radial-gradient(45% 40% at 90% 0%, rgba(154,37,48,0.35) 0%, rgba(154,37,48,0) 70%), linear-gradient(180deg, #2a0f12 0%, #3a1216 100%)',
              }}
            />

            {/* Photo panel */}
            <div className="relative hidden items-end justify-center sm:flex">
              <img
                src={PHOTO}
                {...responsive(PHOTO, '(min-width: 1024px) 420px, 45vw')}
                alt="Alluvi Healthcare Tirzepatide kit"
                width={1122}
                height={1402}
                decoding="async"
                draggable={false}
                className="h-full max-h-[34rem] w-full select-none object-cover object-[50%_30%]"
              />
            </div>

            {/* Copy panel */}
            <div className="relative flex flex-col justify-center px-6 py-8 sm:border-l sm:border-white/10 sm:px-9 sm:py-10 lg:px-11">
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-bg ring-1 ring-white/15 transition-colors duration-300 hover:bg-black/50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-sand">Official partner</p>
              <p className="mt-4 font-display text-[1.6rem] font-semibold leading-none tracking-[0.02em] text-bg">ALLUVI</p>
              <p className="mt-1 text-[0.62rem] uppercase tracking-[0.3em] text-bg/70">Healthcare</p>

              <h2
                id="partner-popup-title"
                className="mt-6 font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] font-medium leading-[1.1] tracking-[-0.015em] text-bg"
              >
                Authorised reseller of Alluvi research products.
              </h2>
              <p className="mt-4 max-w-[26rem] text-[0.9rem] leading-[1.65] text-bg/75">
                Every pen on this site is a genuine Alluvi Healthcare kit, supplied through our authorised partnership,
                batch-verified by Janoshik Analytical and shipped sealed and cold.
              </p>

              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Assurances">
                {['Genuine Alluvi batches', 'Janoshik verified'].map((t) => (
                  <li key={t} className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-[0.72rem] font-medium text-bg">
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3" onClick={close}>
                <CtaLink to="/products" variant="solid-light" className="!px-7 !text-xs !uppercase !tracking-[0.18em]" plain>
                  Shop the range
                </CtaLink>
                <CtaLink to="#why" variant="outline-light" className="!border-0 !bg-transparent !px-0 !text-sm hover:!bg-transparent hover:!text-sand" plain>
                  Verify a batch
                </CtaLink>
              </div>

              <p className="mt-6 text-[0.68rem] leading-[1.5] text-bg/50">
                For research purposes only. Not intended for human or veterinary use.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
