import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import Magnetic from './Magnetic'
import { scrollToHash } from '../../lib/scrollToHash'

type Variant = 'solid' | 'outline' | 'solid-light' | 'outline-light'

interface Props {
  /**
   * Destination. One of:
   *   - an app route  → "/shop"        (client-side <Link>, no page reload)
   *   - an in-page id → "#about"       (Lenis smooth scroll, or route + scroll
   *                                     when the user is not on the homepage)
   *   - an external   → "https://…"    (opened in a new tab, safely)
   * There is deliberately no way to express `href="#"` — every CTA resolves to
   * a real destination.
   */
  to: string
  children: ReactNode
  variant?: Variant
  className?: string
  /** Trailing arrow/rule flourish, matching the existing section links. */
  arrow?: boolean
  /** Skip the magnetic wrapper (e.g. inside an already-animated container). */
  plain?: boolean
}

/**
 * Shared call-to-action link.
 *
 * The site already had four hand-rolled variations of the same pill button
 * (Navbar "Shop", Products "View full catalogue" desktop + mobile, Footer
 * "Subscribe"). This centralises that styling so CTAs stay consistent, and
 * routes through react-router so internal navigation never triggers a full
 * browser reload.
 *
 * Accessibility: renders a real <a>/<Link>, so it is focusable and activates on
 * Enter with no extra key handling. The global :focus-visible ring in index.css
 * provides the visible focus state; nothing here removes it.
 */
const BASE =
  'group inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-sm tracking-wide transition-colors duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]'

const VARIANTS: Record<Variant, string> = {
  // Primary — teal pill on light backgrounds.
  solid: 'bg-accent-dark text-bg hover:bg-accent',
  // Secondary — outlined teal on light backgrounds.
  outline: 'border border-accent-dark text-accent-dark hover:bg-accent-dark hover:text-bg',
  // Primary on dark/photographic backgrounds (hero overlay, CTA section).
  'solid-light': 'bg-bg text-ink hover:bg-gold hover:text-ink',
  // Secondary on dark/photographic backgrounds. The translucent scrim +
  // backdrop-blur is not decoration: white-on-photo contrast varies with
  // whatever is behind the button, and this guarantees a dark enough backing
  // for the label to stay legible wherever it lands. Same treatment the hero
  // headline gets from its drop-shadow, and the same idea as the site's
  // existing `.glass` utility.
  'outline-light':
    'border border-bg/60 bg-ink/25 text-bg backdrop-blur-[2px] hover:border-bg hover:bg-bg hover:text-ink',
}

export default function CtaLink({
  to,
  children,
  variant = 'solid',
  className = '',
  arrow = false,
  plain = false,
}: Props) {
  const location = useLocation()
  const navigate = useNavigate()

  const classes = `${BASE} ${VARIANTS[variant]} ${className}`

  const content = (
    <>
      {children}
      {arrow && (
        <span
          aria-hidden="true"
          className="transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
        >
          →
        </span>
      )}
    </>
  )

  const isExternal = /^https?:\/\//.test(to)
  const isHash = to.startsWith('#')

  if (isExternal) {
    return (
      <Wrap plain={plain}>
        <a href={to} target="_blank" rel="noopener noreferrer" className={classes}>
          {content}
        </a>
      </Wrap>
    )
  }

  if (isHash) {
    // Real href (so it is copyable, opens in a new tab, and is crawlable as an
    // internal link) with the smooth-scroll behaviour layered on top. Off the
    // homepage it falls through to a normal navigation to /#id, which Navbar's
    // hash effect then scrolls to.
    return (
      <Wrap plain={plain}>
        <a
          href={`/${to}`}
          onClick={(e) => {
            if (location.pathname !== '/') {
              e.preventDefault()
              navigate(`/${to}`)
              return
            }
            e.preventDefault()
            scrollToHash(to)
          }}
          className={classes}
        >
          {content}
        </a>
      </Wrap>
    )
  }

  return (
    <Wrap plain={plain}>
      <Link to={to} className={classes}>
        {content}
      </Link>
    </Wrap>
  )
}

function Wrap({ plain, children }: { plain: boolean; children: ReactNode }) {
  return plain ? <>{children}</> : <Magnetic className="inline-block">{children}</Magnetic>
}
