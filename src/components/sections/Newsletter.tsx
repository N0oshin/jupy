import { useState } from 'react'
import { Link } from 'react-router-dom'
import SplitReveal from '../ui/SplitReveal'
import Reveal from '../ui/Reveal'
import Magnetic from '../ui/Magnetic'
import { newsletterService } from '../../services/newsletter.service'
import type { ApiError } from '../../types/api'

/** `source` sent with the signup so these can be told apart from the footer list. */
const SOURCE = 'home_first_order_10'

/** Lifestyle photo used as the full-bleed background of the band. */
const BG_IMG = encodeURI('/images/ecom/Women holding ALLUVI wellness pens.png')

/**
 * First-order discount capture — "10% off your first order" for an email.
 * Posts to the same newsletter endpoint as the footer with its own `source`.
 * The welcome email carrying the code is sent server-side.
 */
export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setMsg(null)
    try {
      const res = await newsletterService.subscribe(email.trim(), SOURCE, website)
      setMsg({
        tone: 'ok',
        text:
          'already_subscribed' in res
            ? "You're already on the list — your code is in your inbox."
            : 'Welcome to the lab. Your 10% code is on its way to your inbox.',
      })
      setEmail('')
    } catch (err) {
      const status = (err as ApiError).status
      setMsg({
        tone: 'err',
        text: status === 429 ? 'Too many submissions. Try again later.' : (err as Error).message || 'Failed to subscribe.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="newsletter" aria-labelledby="newsletter-title" className="relative overflow-hidden border-t border-line bg-section text-ink">
      {/* Full-bleed lifestyle photo; the card sits over its bottom-left corner on larger screens. */}
      <div className="relative min-h-[26rem] lg:min-h-[34rem]">
        <img
          src={BG_IMG}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[center_top]"
        />
        {/* Subtle fade so the card and the photo edge don't fight each other. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

        <div className="container-x relative flex h-full min-h-[26rem] items-end justify-center pb-6 pt-56 sm:pt-64 lg:min-h-[34rem] lg:pb-10">
          <Reveal className="w-full max-w-xl text-center">
            <div className="rounded-3xl bg-card/90 p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] sm:p-8" >
              <p className="eyebrow mb-4 !text-[0.8rem]">Stay in the loop</p>
              <SplitReveal
                as="h2"
                mode="lines"
                stagger={0.12}
                className="font-display text-[clamp(1.5rem,1rem+1.9vw,2.4rem)] font-medium leading-[1.08] tracking-[-0.015em] text-ink"
              >
                {'Keep in touch.'}
              </SplitReveal>
              <span id="newsletter-title" className="sr-only">
                Keep in touch and get 10% off your first order
              </span>
              <p className="mt-4 text-[0.95rem] leading-[1.6] text-muted text-pretty">
                Leave your email and we will send a single-use 10% code for your first order, plus occasional notes on
                new compounds and batch releases. No noise, unsubscribe any time.
              </p>

              <form
                onSubmit={onSubmit}
                className="mx-2 my-8 flex flex-col gap-2 rounded-3xl border border-line bg-section p-5 sm:flex-row sm:items-center sm:gap-4 sm:rounded-full sm:py-2.5 sm:pl-6 sm:pr-2.5 text-left"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  className="w-full bg-transparent px-4 py-2 text-sm text-ink outline-none placeholder:text-muted/70 disabled:opacity-60 sm:px-0 sm:py-0"
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
                    className="w-full rounded-full bg-accent-dark px-6 py-2 text-[0.8rem] text-bg transition-colors hover:bg-accent disabled:opacity-70"
                  >
                    {busy ? 'Sending…' : 'Get my code'}
                  </button>
                </Magnetic>
              </form>
              <p className="mt-3 text-xs text-muted" aria-live="polite">
                {msg ? (
                  <span className={msg.tone === 'ok' ? 'text-accent-dark' : 'text-red-600'}>{msg.text}</span>
                ) : (
                  <>
                    By subscribing you agree to our{' '}
                    <Link to="/privacy-policy" className="underline underline-offset-4 hover:text-accent-dark">
                      privacy policy
                    </Link>
                    . One code per customer, first order only.
                  </>
                )}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
