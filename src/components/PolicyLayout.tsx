import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './sections/Footer'

interface Props {
  eyebrow: string
  title: string
  intro?: string
  children: ReactNode
}

/** Shared shell for legal/info pages (privacy, terms, refund, shipping, …). */
export default function PolicyLayout({ eyebrow, title, intro, children }: Props) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 bg-bg pt-28 lg:pt-32">
        <div className="container-x pb-24">
          <div className="max-w-3xl border-b border-line pb-8">
            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-accent-dark">{eyebrow}</p>
            <h1 className="mt-2 font-display text-4xl tracking-[-0.02em] text-ink lg:text-5xl">{title}</h1>
            {intro && <p className="mt-3 max-w-xl text-sm text-muted">{intro}</p>}
          </div>

          <div className="policy-content mt-10 max-w-3xl">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}

/** Section heading for policy body copy — keep markup minimal, style via `.policy-content`. */
export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <div className="mt-3 space-y-4 text-sm leading-[1.7] text-muted">{children}</div>
    </section>
  )
}
