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
      <main id="main-content" className="relative z-10 bg-[#fdfcf8] pt-28 lg:pt-32">
        <div className="container-x pb-16 sm:px-8 md:px-16 lg:px-28 xl:px-40">
          <div className="mx-auto max-w-3xl border-b border-line pb-8 text-center">
            <p className="text-[0.8rem] uppercase tracking-[0.28em] text-accent-dark">{eyebrow}</p>
            <h1 className="mt-2 text-balance font-display text-[clamp(1.35rem,0.9rem+1.7vw,2.1rem)] font-medium leading-[1.08] tracking-[-0.015em] text-ink">{title}</h1>
            {intro && <p className="mx-auto mt-3 max-w-xl text-[0.9rem] text-muted">{intro}</p>}
          </div>

          <div className="policy-content mx-auto mt-10 max-w-3xl">{children}</div>
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
      <h2 className="font-display text-base font-medium text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[0.8rem] leading-[1.6] text-muted">{children}</div>
    </section>
  )
}
