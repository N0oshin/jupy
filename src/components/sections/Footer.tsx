import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SplitReveal from '../ui/SplitReveal'
import Magnetic from '../ui/Magnetic'
import SocialLinks from '../ui/SocialLinks'
import { SOCIALS_CONFIGURED } from '../../lib/social'
import { newsletterService } from '../../services/newsletter.service'
import { useAuth } from '../../lib/AuthContext'
import type { ApiError } from '../../types/api'
import { scrollToHash } from '../SmoothScroll'

type FooterLink = { label: string; to: string; hash?: boolean }

const COLS: { h: string; links: FooterLink[] }[] = [
  {
    h: 'Catalogue',
    links: [
      { label: 'BPC-157 & TB-500', to: '/products/bpc-157-tb-500' },
      { label: 'Retatrutide 20mg', to: '/products/retatrutide-20mg' },
      { label: 'Retatrutide 40mg', to: '/products/retatrutide-40mg' },
      { label: 'Tirzepatide 40mg', to: '/products/tirzepatide-40mg' },
      { label: 'Glow 70mg (GHK-Cu)', to: '/products/glow-70mg' },
      { label: 'NAD+ 1,000mg', to: '/products/nad-plus-1000mg' },
    ],
  },
  {
    h: 'Company',
    links: [
      { label: 'About Us', to: '/about-us' },
      { label: 'Why Us', to: '#why', hash: true },
      { label: 'Testimonials', to: '#testimonials', hash: true },
      // Was '#contact', which only scrolled to this footer. It now points at the
      // real /contact page and its form.
      { label: 'Contact', to: '/contact' },
      { label: 'Shop All', to: '/products' },
    ],
  },
  {
    h: 'Account',
    links: [
      { label: 'Cart', to: '/cart' },
      { label: 'Track Order', to: '/track' },
      { label: 'Sign In', to: '/signin' },
      { label: 'Create Account', to: '/register' },
    ],
  },
  {
    h: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms-of-service' },
    ],
  },
]

export default function Footer() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setMsg(null)
    try {
      const res = await newsletterService.subscribe(email.trim(), 'footer_signup', website)
      if ('already_subscribed' in res) {
        setMsg({ tone: 'ok', text: "You're already on the list." })
      } else {
        setMsg({ tone: 'ok', text: 'Thanks — research notes incoming.' })
      }
      setEmail('')
    } catch (err) {
      const status = (err as ApiError).status
      setMsg({
        tone: 'err',
        text:
          status === 429
            ? 'Too many submissions. Try again later.'
            : (err as Error).message || 'Failed to subscribe.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <footer id="contact" className="relative overflow-hidden bg-bg pt-16">
      <div className="container-x">
        {/* Newsletter */}
        <div className="grid gap-10 border-b border-line pb-16 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="eyebrow mb-5">Join the lab</p>
            <SplitReveal as="h2" mode="lines" className="type-section font-display font-medium leading-[1.08] tracking-[-0.015em] text-ink">
              {'Research notes, worth\nopening.'}
            </SplitReveal>
          </div>
          <div className="flex flex-col gap-2">
            <form
              onSubmit={onSubscribe}
              className="flex flex-col gap-2 rounded-3xl border border-line bg-card p-2 sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:pl-6"
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="w-full bg-transparent px-4 py-3 text-ink outline-none placeholder:text-muted/70 disabled:opacity-60 sm:px-0 sm:py-0"
              />
              {/* Honeypot — must stay empty */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />
              <Magnetic className="w-full sm:w-auto sm:shrink-0">
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-full bg-accent-dark px-7 py-3 text-sm text-bg transition-colors hover:bg-accent disabled:opacity-70"
                >
                  {busy ? 'Subscribing…' : 'Subscribe'}
                </button>
              </Magnetic>
            </form>
            {msg && (
              <p className={`pl-6 text-xs ${msg.tone === 'ok' ? 'text-accent-dark' : 'text-red-600'}`}>
                {msg.text}
              </p>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            {/* Was href="#top", which only exists on the homepage — on /contact,
                /shop, a product page or any policy page it resolved to nothing.
                Pointing it at "/" gives the brand mark the destination users
                expect from a footer logo on every route. */}
            <Link
              to="/"
              className="inline-flex items-center gap-3 font-display text-ink"
            >
              <span className="text-3xl font-semibold lowercase tracking-[-0.05em]" style={{ fontFeatureSettings: '"ss01", "cv01"' }}>
                <span className="italic text-accent-dark">j</span>upyter
              </span>
              <span className="h-7 w-px bg-accent-dark/50" />
              <span className="text-[0.8rem] uppercase tracking-[0.34em] text-accent-dark">Labs</span>
            </Link>
            <p className="mt-5 max-w-xs text-muted">
              Research-grade peptides. HPLC-verified, traceable to the lot, documented to the milligram.
            </p>
            {/* Social row and scam warning are mutually exclusive: the warning
                is only true while no profile is configured in lib/social.ts, and
                SocialLinks renders nothing until one is. Driving both from
                SOCIALS_CONFIGURED means they can never contradict each other. */}
            {SOCIALS_CONFIGURED ? (
              <SocialLinks className="mt-6" label="Jupyter Labs on social media" />
            ) : (
              <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted/80">
                Jupyter Labs does not operate on any social media platforms. Please beware of scam accounts claiming to
                represent us.
              </p>
            )}
          </div>
          {COLS.map((c) => (
            <div key={c.h}>
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-ink">{c.h}</h3>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.hash ? (
                      <a
                        href={`/${l.to}`}
                        onClick={(e) => {
                          if (window.location.pathname === '/') {
                            e.preventDefault()
                            scrollToHash(l.to)
                          }
                        }}
                        className="text-muted transition-colors hover:text-accent-dark"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.to} className="text-muted transition-colors hover:text-accent-dark">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Giant wordmark — purely decorative: it restates the brand name already
            announced by the logo and the copyright line, and at 10% opacity it is
            intentionally below text-contrast thresholds. Hidden from assistive tech
            rather than recoloured, so the design is preserved. */}
        <div className="select-none overflow-hidden" aria-hidden="true">
          <div className="flex items-center gap-[2vw] font-display leading-[0.8] tracking-[-0.05em] text-accent-dark/10">
            <span className="text-[20vw] font-medium lowercase" style={{ fontFeatureSettings: '"ss01", "cv01"' }}>
              <span className="italic">j</span>upyter
            </span>
            <span className="h-[10vw] w-[2px] bg-accent-dark/15" />
            <span className="text-[2.2vw] uppercase tracking-[0.32em]">Labs</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-line py-8 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Jupyter Labs. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {isAuthenticated ? (
              <>
                <span className="text-ink">Hi, {user?.name?.split(' ')[0] || 'researcher'}</span>
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/signin')
                  }}
                  className="hover:text-accent-dark"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="hover:text-accent-dark">Sign in</Link>
                <Link to="/register" className="hover:text-accent-dark">Create account</Link>
              </>
            )}
            <Link to="/track" className="hover:text-accent-dark">Track order</Link>
          </div>
          <p className="text-xs uppercase tracking-[0.2em]">For research use only · Not for human consumption</p>
        </div>
      </div>
    </footer>
  )
}
