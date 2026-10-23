import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import Heading from '../components/ui/Heading'
import Reveal from '../components/ui/Reveal'
import Img from '../components/ui/Img'
import CtaLink from '../components/ui/CtaLink'
import { useSeo, SITE_URL } from '../lib/useSeo'

/**
 * Types the paragraphs out one character run at a time once scrolled into view.
 * The full text is always in the DOM (sr-only, and as an invisible spacer under
 * each typed line) so screen readers get it immediately and the block never
 * changes height while typing. Reduced-motion users get the finished text.
 */
function TypedStory({ paragraphs }: { paragraphs: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })
  const total = paragraphs.reduce((n, p) => n + p.length, 0)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [typed, setTyped] = useState(0)
  const count = reduced ? total : typed

  useEffect(() => {
    if (!inView || reduced) return
    const id = window.setInterval(() => {
      setTyped((c) => {
        if (c + 1 >= total) window.clearInterval(id)
        return Math.min(c + 1, total)
      })
    }, 18)
    return () => window.clearInterval(id)
  }, [inView, reduced, total])

  // Start index of each paragraph within the overall character count.
  const starts = paragraphs.map((_, i) => paragraphs.slice(0, i).reduce((n, p) => n + p.length, 0))

  return (
    <div ref={ref} className="space-y-5 text-sm leading-[1.7] text-muted">
      {paragraphs.map((p, i) => {
        const offset = starts[i]
        const shown = Math.max(0, Math.min(p.length, count - offset))
        const typing = count > offset && count < offset + p.length + 1 && count < total
        return (
          <p key={i} className="relative text-pretty">
            <span className="sr-only">{p}</span>
            <span aria-hidden="true" className="invisible">{p}</span>
            <span aria-hidden="true" className="absolute inset-0">
              {p.slice(0, shown)}
              {typing && <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[0.2em] animate-pulse bg-ink" />}
            </span>
          </p>
        )
      })}
    </div>
  )
}

/** Origin story. Moved here from the homepage "Why Us" section. */
const STORY = [
  'Jupyter Labs was founded by two scientists frustrated by the lack of transparency in peptide sourcing. Too often the label was the only evidence on offer: a name, a milligram figure, and an assurance that everything was in order.',
  'We believed researchers deserved more than a label. They deserved clear documentation, traceability, and measurable quality information, the same standard of evidence they would expect of any result in their own work.',
  'So that is how we built the company. Every product is supported by lot-level documentation and clearly stated specifications, and where applicable each batch is characterised by HPLC before it is listed. We would rather show our working than ask for your trust.',
]

/**
 * Our Standard — the four pillars from the About Us sheet.
 *
 * Each cell in the sheet is written as "Label. Sentence.", so the label is
 * split out here to render as the pillar heading rather than being buried at
 * the head of the body copy. `icon` is a decorative motif only (aria-hidden) —
 * it carries no content and exists purely to strengthen the visual hierarchy.
 */
const STANDARD = [
  { n: '01', t: 'Tested', d: 'Independent analytical testing helps verify key quality attributes.', icon: 'tested' },
  { n: '02', t: 'Traceable', d: 'Lot-level documentation provides visibility from production to finished peptide pen.', icon: 'traceable' },
  { n: '03', t: 'Clearly Specified', d: 'Every product is labeled with straightforward quantity and product information.', icon: 'specified' },
  {
    n: '04',
    t: 'Responsibly Packaged',
    d: 'Peptide pens are handled and packaged with applicable storage and stability requirements in mind.',
    icon: 'packaged',
  },
] as const

/** Decorative pillar glyphs. Purely illustrative — hidden from assistive tech. */
function PillarIcon({ name }: { name: (typeof STANDARD)[number]['icon'] }) {
  const common = {
    width: 56,
    height: 56,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 0.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (name) {
    case 'tested':
      return (
        <svg {...common}>
          <path d="M9 3h6M10 3v5l-4.4 8.2A2 2 0 0 0 7.4 19h9.2a2 2 0 0 0 1.8-2.8L14 8V3" />
          <path d="M8 14h8" />
        </svg>
      )
    case 'traceable':
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2.2" />
          <circle cx="18" cy="18" r="2.2" />
          <path d="M8 6h6a4 4 0 0 1 0 8H8.2" />
          <path d="M8 6l-0 8" opacity="0" />
        </svg>
      )
    case 'specified':
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M9 13h6M9 17h4" />
        </svg>
      )
    case 'packaged':
      return (
        <svg {...common}>
          <path d="M21 8l-9-5-9 5 9 5 9-5z" />
          <path d="M3 8v8l9 5 9-5V8M12 13v8" />
        </svg>
      )
  }
}

export default function AboutUs() {
  useSeo({
    title: 'USA Research Peptide Supplier | About Jupyter Labs',
    description:
      'Jupyter Labs, a USA research peptide supplier providing innovative laboratory compounds, science-backed formulations, Janoshik-tested products',
    path: '/about',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': `${SITE_URL}/about#aboutpage`,
      url: `${SITE_URL}/about`,
      name: 'About Jupyter Labs',
      description:
        'Jupyter Labs was founded by two scientists frustrated by the lack of transparency in peptide sourcing.',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
    },
  })

  return (
    <>
      <Navbar />
      <main id="main-content" className="relative z-10 bg-[#fffdf8]">
        {/* ───── HERO + ORIGIN ─────
            Full-bleed photograph at three quarters of the viewport height with all the copy pinned
            to the bottom over a dark gradient. Copy stays first in the DOM so the
            H1 leads the document; the image is decorative layering behind it.
            svh (not vh) keeps it exactly one screen on mobile browsers whose URL
            bar collapses. */}
        <section className="relative isolate flex h-[75svh] min-h-[30rem] items-end overflow-hidden">
          <Img
            src="/images/ecom/about-hero-alluvi-pens.webp"
            alt="Two women holding ALLUVI research pens"
            className="!absolute inset-0 -z-20 h-full w-full"
            sizes="100vw"
            objectPosition="50% 30%"
            eager
          />
          {/* Legibility scrim: transparent over the faces, dark behind the copy. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/45 to-transparent to-65%"
          />

          <div className="container-x w-full pb-10 lg:pb-16">
          

            <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-14">
              <Heading
                as="h1"
                light
                title="Explore Jupyter Lab Peptides"
                intro="Driven by Transparency."
                introClassName="!text-[0.8rem] font-medium uppercase tracking-[0.28em]"
                className="lg:col-span-12 !max-w-none"
              />
            
            </div>
          </div>
        </section>

        {/* ───── OUR STORY ─────
            Centred heading, the story typed out beneath it, and the "we document"
            line as a contrasting accent-coloured card at the foot of the story. */}
        <section id="story" className="relative overflow-hidden border-t border-line">
          <div className="pointer-events-none absolute -right-40 top-10 h-[28rem] w-[28rem] rounded-full bg-sand/20 blur-[140px]" />
          <div className="container-x relative pt-14 pb-8 lg:pt-20 lg:pb-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-4">
                <span className="h-px w-12 bg-ink" />
                <p className="eyebrow !text-ink">Our story</p>
                <span className="h-px w-12 bg-ink" />
              </div>
            </div>

            <div className="mx-auto mt-12 max-w-3xl lg:mt-16">
              <TypedStory paragraphs={STORY} />
            </div>

            
          </div>
        </section>

        {/* ───── OUR STANDARD ───── */}
        <section className="relative overflow-hidden pb-14 lg:pb-20">
          <div className="pointer-events-none absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-sand/20 blur-[140px]" />
          <div className="container-x relative py-8 lg:py-14">
            {/* Modern tile grid: hairline-bordered frosted cards, an icon tile that
                inverts to the brand colour on hover, a tabular step index, and a
                gradient rail that draws in along the top edge. */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STANDARD.map((s, i) => (
                <Reveal
                  key={s.n}
                  delay={i * 0.08}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-line/80 bg-card/70 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-ink/25 hover:bg-card hover:shadow-[0_22px_44px_-30px_rgba(42,15,18,0.35)] lg:p-7"
                >
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-ink via-ink/60 to-transparent transition-transform duration-700 group-hover:scale-x-100" />
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink/[0.07] text-ink ring-1 ring-inset ring-ink/10 transition-colors duration-500 group-hover:bg-ink group-hover:text-bg [&>svg]:h-6 [&>svg]:w-6 [&>svg]:[stroke-width:1.5]">
                      <PillarIcon name={s.icon} />
                    </span>
                    <span className="rounded-full border border-line px-2.5 py-1 text-[0.65rem] font-medium tabular-nums tracking-[0.14em] text-muted">
                      {s.n}
                    </span>
                  </div>
                  <h3 className="mt-10 font-display text-lg font-medium leading-tight tracking-[-0.01em] text-ink">{s.t}</h3>
                  <p className="mt-2 text-sm leading-[1.6] text-muted text-pretty">{s.d}</p>
                </Reveal>
              ))}
            </div>
          </div>
           <Reveal delay={0.25}>
              <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <CtaLink to="/products" className="!bg-ink hover:!bg-ink/85">
                  Explore the catalogue
                </CtaLink>
                <CtaLink to="/contact" variant="outline" className="!border-ink !text-ink hover:!bg-ink hover:!text-bg">
                  Contact Us
                </CtaLink>
              </div>
            </Reveal>
        </section>

   
      
      </main>
      <Footer />
    </>
  )
}
