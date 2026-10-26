import { Link } from 'react-router-dom'
import SocialLinks from '../ui/SocialLinks'
import { SOCIALS_CONFIGURED } from '../../lib/social'
import { scrollToHash } from '../../lib/scrollToHash'
import { CATEGORIES, type Category } from '../../lib/content'

type FooterLink = { label: string; to: string; hash?: boolean }

const COLS: { h: string; links: FooterLink[] }[] = [
  {
    h: 'Category',
    // One link per shop category; "All products" is the unfiltered catalogue.
    links: (CATEGORIES as readonly Category[]).map((c) => ({
      label: c.label,
      to: c.all ? '/products' : `/products?category=${c.id}`,
    })),
  },
  {
    h: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Wholesale', to: '/wholesale' },
      { label: 'Why Us', to: '#about', hash: true },
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
      { label: 'Shipping Policy', to: '/shipping-policy' },
      { label: 'Refund Policy', to: '/refund-policy' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms-of-service' },
    ],
  },
]

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-bg pt-16">
      <div className="container-x">
        {/* Links */}
        <div className="grid gap-12 pb-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            {/* Was href="#top", which only exists on the homepage — on /contact,
                /shop, a product page or any policy page it resolved to nothing.
                Pointing it at "/" gives the brand mark the destination users
                expect from a footer logo on every route. */}
            <Link
              to="/"
              className="inline-flex items-center gap-3 font-display text-ink"
            >
              <span className="text-3xl font-semibold lowercase tracking-[-0.015em]" style={{ fontFeatureSettings: '"ss01", "cv01"' }}>
                <span className="italic text-accent-dark">j</span>upyter
              </span>
              <span className="h-7 w-px bg-accent-dark/50" />
              <span className="text-[0.8rem] uppercase tracking-[0.34em] text-accent-dark">Labs</span>
            </Link>
           
            {/* Social row and scam warning are mutually exclusive: the warning
                is only true while no profile is configured in lib/social.ts, and
                SocialLinks renders nothing until one is. Driving both from
                SOCIALS_CONFIGURED means they can never contradict each other. */}
            {SOCIALS_CONFIGURED ? (
              <SocialLinks className="mt-6" label="Jupyter Labs on social media" />
            ) : (
              <p className="mt-6 max-w-xs text-xs leading-relaxed text-muted/80">
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
                        className="text-sm text-muted transition-colors hover:text-accent-dark"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.to} className="text-sm text-muted transition-colors hover:text-accent-dark">
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
          <div className="flex items-center gap-[2vw] font-display leading-[0.8] tracking-[-0.015em] text-accent-dark/10">
            <span className="text-[14vw] font-medium lowercase" style={{ fontFeatureSettings: '"ss01", "cv01"' }}>
              <span className="italic">j</span>upyter
            </span>
            <span className="h-[7vw] w-[2px] bg-accent-dark/15" />
            <span className="text-[1.6vw] uppercase tracking-[0.32em]">Labs</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-line py-5 text-[0.8125rem] text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Jupyter Labs. All rights reserved.</p>
          
          <p className="text-xs uppercase tracking-[0.1em]">For research use only </p>
        </div>
      </div>
    </footer>
  )
}
