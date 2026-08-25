import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { NAV } from '../lib/content'
import { scrollToHash } from './SmoothScroll'
import { useCart } from '../lib/CartContext'
import { useAuth } from '../lib/AuthContext'

const MENU_EASE = [0.16, 1, 0.3, 1] as const

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { count } = useCart()
  const { isAuthenticated, user, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock background scroll while the fullscreen menu is open. The page scroller
  // is Lenis (on <html>), so pause it; also lock body as a reduced-motion fallback.
  useEffect(() => {
    if (!open) return
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis
    lenis?.stop()
    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      lenis?.start()
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [open])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Close the desktop account dropdown on outside click or Escape.
  useEffect(() => {
    if (!accountOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAccountOpen(false)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [accountOpen])

  // Close the account dropdown whenever the route changes.
  useEffect(() => {
    setAccountOpen(false)
  }, [location.pathname])

  // Scroll to the hash target after route changes (e.g. tapping "About" in the
  // mobile menu while on /cart navigates to /#about — without this, the page
  // would mount at the top and ignore the hash). Also handles deep links like
  // /#products. Delay lets the home page DOM mount + Lenis attach first.
  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return
    const id = setTimeout(() => scrollToHash(location.hash), 120)
    return () => clearTimeout(id)
  }, [location.pathname, location.hash])

  function go(e: React.MouseEvent, href: string) {
    e.preventDefault()
    const wasOpen = open
    setOpen(false)
    // NAV entries that aren't '#section' are real app routes (e.g. /contact) —
    // navigate client-side rather than trying to scroll to a nonexistent anchor.
    if (!href.startsWith('#')) {
      navigate(href)
      return
    }
    if (location.pathname !== '/') {
      navigate('/' + href)
      return
    }
    // When the mobile menu was open, the `open` effect's cleanup restarts
    // Lenis on the next render. Defer so the scroll lands on a running engine.
    if (wasOpen) {
      setTimeout(() => scrollToHash(href), 60)
    } else {
      scrollToHash(href)
    }
  }

  return (
    <>
    <motion.header
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-[80]"
    >
      {/* Full-bleed frosted bar (sits behind the width-capped content). */}
      <div
        className={`pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500 ${
          scrolled || open || location.pathname !== '/' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="glass h-full w-full" />
      </div>

      <div
        className={`container-x flex items-center justify-between transition-all duration-500 ${
          scrolled ? 'py-3' : 'py-5'
        }`}
      >
        <Link
          to="/"
          className="group inline-flex items-center gap-2.5 font-display text-ink"
        >
          <span className="relative text-2xl font-semibold lowercase tracking-[-0.05em]" style={{ fontFeatureSettings: '"ss01", "cv01"' }}>
            <span className="italic text-accent-dark transition-colors duration-500 group-hover:text-accent">j</span>upyter
            <span className="absolute -bottom-1 left-0 h-[2px] w-[0.45em] origin-left scale-x-0 bg-accent-dark transition-transform duration-500 group-hover:scale-x-100" />
          </span>
          <span className="h-5 w-px bg-accent-dark/40 transition-colors duration-500 group-hover:bg-accent" />
          <span className="text-[0.7rem] uppercase tracking-[0.34em] text-accent-dark transition-colors duration-500 group-hover:text-accent">
            Labs
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={(e) => go(e, n.href)}
              className="group relative text-sm tracking-wide text-ink/75 transition-colors hover:text-ink"
            >
              {n.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent-dark transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div ref={accountRef} className="relative">
            {isAuthenticated ? (
              <button
                type="button"
                aria-label={`Account — ${user?.name?.split(' ')[0] || 'researcher'}`}
                title={`Signed in as ${user?.name?.split(' ')[0] || 'researcher'}`}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((v) => !v)}
                className="relative grid h-10 w-10 place-items-center rounded-full border border-line bg-card text-ink transition-all hover:border-accent-dark/40 hover:text-accent-dark"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                </svg>
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-dark ring-2 ring-bg"
                />
              </button>
            ) : (
              <Link
                to="/signin"
                aria-label="Sign in"
                title="Sign in"
                className="relative grid h-10 w-10 place-items-center rounded-full border border-line bg-card text-ink transition-all hover:border-accent-dark/40 hover:text-accent-dark"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </Link>
            )}

            <AnimatePresence>
              {accountOpen && isAuthenticated && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: MENU_EASE }}
                  className="glass absolute right-0 top-[calc(100%+0.6rem)] z-[90] w-56 overflow-hidden rounded-2xl border border-line py-1.5 shadow-lg"
                >
                  <div className="border-b border-line px-4 py-2.5 text-sm text-muted">
                    Signed in as <span className="text-ink">{user?.name?.split(' ')[0] || 'researcher'}</span>
                  </div>
                  <Link
                    to="/orders"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink transition-colors hover:bg-card"
                  >
                    My orders
                  </Link>
                  <Link
                    to="/track"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink transition-colors hover:bg-card"
                  >
                    Track order
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setAccountOpen(false)
                      logout()
                      navigate('/signin')
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-card"
                  >
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/cart"
            aria-label={`Cart (${count} items)`}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-line bg-card text-ink transition-all hover:border-accent-dark/40 hover:text-accent-dark"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21 8H6" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-accent-dark px-1 text-[0.65rem] font-semibold text-bg">
                {count}
              </span>
            )}
          </Link>

          <Link
            to="/products"
            className="hidden rounded-full bg-accent-dark px-6 py-2.5 text-sm text-bg transition-colors hover:bg-accent md:inline-block"
          >
            Shop
          </Link>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span className={`h-px w-6 bg-ink transition-all ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
            <span className={`h-px w-6 bg-ink transition-all ${open ? '-translate-y-[3px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>
    </motion.header>

      {/* ───── Premium fullscreen overlay menu (mobile) ───── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: MENU_EASE }}
            className="fixed inset-0 z-[70] flex flex-col overflow-y-auto overscroll-contain bg-bg/98 backdrop-blur-2xl md:hidden"
          >
            <div className="grain pointer-events-none fixed inset-0 opacity-30" />
            <div className="pointer-events-none fixed -right-24 top-10 h-80 w-80 rounded-full bg-accent/15 blur-[120px]" />
            <div className="pointer-events-none fixed -left-24 bottom-10 h-80 w-80 rounded-full bg-sand/30 blur-[120px]" />

            <nav className="container-x relative flex min-h-full flex-col pb-[max(2rem,env(safe-area-inset-bottom))] pt-24">
              <div className="my-auto flex w-full flex-col gap-1">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: MENU_EASE }}
                className="eyebrow mb-6"
              >
                Menu
              </motion.p>

              {NAV.map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={(e) => go(e, n.href)}
                  initial={{ opacity: 0, y: 34 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.14 + i * 0.07, ease: MENU_EASE }}
                  className="group flex items-center justify-between border-b border-line py-3.5 font-display text-[clamp(1.85rem,10vw,3rem)] font-light leading-[1.1] tracking-[-0.02em] text-ink"
                >
                  {n.label}
                  <span className="text-2xl text-accent-dark opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                    →
                  </span>
                </motion.a>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 34 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.14 + NAV.length * 0.07, ease: MENU_EASE }}
              >
                <Link
                  to="/track"
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between border-b border-line py-3.5 font-display text-[clamp(1.85rem,10vw,3rem)] font-light leading-[1.1] tracking-[-0.02em] text-ink"
                >
                  Track order
                  <span className="text-2xl text-accent-dark opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                    →
                  </span>
                </Link>
              </motion.div>

              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 34 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.14 + (NAV.length + 1) * 0.07, ease: MENU_EASE }}
                >
                  <Link
                    to="/orders"
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between border-b border-line py-3.5 font-display text-[clamp(1.85rem,10vw,3rem)] font-light leading-[1.1] tracking-[-0.02em] text-ink"
                  >
                    My orders
                    <span className="text-2xl text-accent-dark opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                </motion.div>
              )}

              {isAuthenticated ? (
                <motion.button
                  type="button"
                  onClick={() => {
                    logout()
                    setOpen(false)
                    navigate('/signin')
                  }}
                  initial={{ opacity: 0, y: 34 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.14 + (NAV.length + 2) * 0.07, ease: MENU_EASE }}
                  className="group flex items-center justify-between border-b border-line py-3.5 text-left font-display text-[clamp(1.85rem,10vw,3rem)] font-light leading-[1.1] tracking-[-0.02em] text-ink"
                >
                  <span>
                    Sign out
                    <span className="ml-3 align-middle text-sm text-muted">
                      · {user?.name?.split(' ')[0] || 'researcher'}
                    </span>
                  </span>
                  <span className="text-2xl text-accent-dark opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                    →
                  </span>
                </motion.button>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 34 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.14 + (NAV.length + 1) * 0.07, ease: MENU_EASE }}
                  >
                    <Link
                      to="/signin"
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between border-b border-line py-3.5 font-display text-[clamp(1.85rem,10vw,3rem)] font-light leading-[1.1] tracking-[-0.02em] text-ink"
                    >
                      Sign in
                      <span className="text-2xl text-accent-dark opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                        →
                      </span>
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 34 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.14 + (NAV.length + 2) * 0.07, ease: MENU_EASE }}
                  >
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between border-b border-line py-3.5 font-display text-[clamp(1.85rem,10vw,3rem)] font-light leading-[1.1] tracking-[-0.02em] text-ink"
                    >
                      Register
                      <span className="text-2xl text-accent-dark opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                        →
                      </span>
                    </Link>
                  </motion.div>
                </>
              )}

              <motion.div
                initial={{ opacity: 0, y: 34 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.14 + (NAV.length + 3) * 0.07, ease: MENU_EASE }}
              >
                <Link
                  to="/products"
                  onClick={() => setOpen(false)}
                  className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-accent-dark py-4 text-base font-medium text-bg transition-colors hover:bg-accent"
                >
                  Shop Jupyter Labs
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-6 text-[0.65rem] uppercase tracking-[0.28em] text-muted"
              >
                For research use only · Not for human consumption
              </motion.p>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
