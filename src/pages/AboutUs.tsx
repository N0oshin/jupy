import Navbar from '../components/Navbar'
import Footer from '../components/sections/Footer'
import Heading from '../components/ui/Heading'
import Reveal from '../components/ui/Reveal'
import Img from '../components/ui/Img'
import CtaLink from '../components/ui/CtaLink'
import { useSeo, SITE_URL } from '../lib/useSeo'

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
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
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
      <main id="main-content" className="relative z-10 bg-bg pt-32 lg:pt-36">
        {/* ───── HERO + ORIGIN ─────
            All the copy sits in one column with the image alongside it, rather
            than the heading spanning full width and the paragraph floating in a
            narrow well beneath. The image is height-driven by the text column
            (lg:h-full + object-cover), so the row is exactly as tall as the copy
            and there is no dead space above or below it to tune away. */}
        {/* Deliberately no ambient tint behind this section — it sits on the flat
            page background so the copy column reads on plain white. */}
        <section>
          <div className="container-x pb-14 lg:pb-20">
            {/* Section label sits at the page's top-left, above the split, rather
                than inside the copy column — which lg:order-2 pushes to the right.
                Same rule-plus-label treatment as "Our Standard" further down. */}
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-accent-dark" />
              <p className="eyebrow">About Jupyter Labs</p>
            </div>

            <div className="mt-8 grid gap-9 lg:mt-12 lg:grid-cols-12 lg:gap-14">
              {/* Copy stays first in the DOM so the H1 leads the document and
                  mobile opens on the heading, not the photograph. The visual
                  left/right swap is done with order utilities on lg only. */}
              <div className="lg:order-2 lg:col-span-6 lg:self-center">
                {/* Spacing escalates rather than being uniform: H1 and tagline
                    read as one title unit at 1.25rem apart, then a 2.25rem break
                    before the body copy, which is a separate block. */}
                <Heading
                  as="h1"
                  title={'Explore Jupyter Lab\nPeptides'}
                  intro="Built by Scientists. Driven by Transparency."
                />
                <Reveal delay={0.15} className="max-w-2xl">
                  <p className="mt-9 text-[1.05rem] leading-[1.65] text-muted text-pretty">
                    Jupyter Labs was founded by two scientists frustrated by the lack of transparency in peptide sourcing.
                    We believed researchers deserved more than a label, They deserved clear documentation, traceability,
                    and measurable quality information.
                  </p>
                </Reveal>
              </div>

              {/* On lg the image is absolutely positioned inside its grid cell, so
                  it contributes nothing to the row height — the copy column alone
                  sets it and the image crops to fill whatever that is. `h-full`
                  alone could not do this: with no definite height to resolve
                  against it fell back to the file's intrinsic ratio, which ran
                  taller than the copy and left dead space beneath the paragraph.
                  min-h is the floor for when the copy is unusually short. */}
              <div className="lg:relative lg:order-1 lg:col-span-6 lg:min-h-[26rem]">
                <Reveal delay={0.1} className="lg:absolute lg:inset-0">
                  <div className="relative h-full">
                    {/* Decorative offset frame behind the photo. */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-4 -right-4 -z-10 hidden h-40 w-40 rounded-[var(--radius-xl2)] bg-gradient-to-br from-accent/25 to-transparent blur-2xl lg:block"
                    />
                    <div className="aspect-[16/11] h-full overflow-hidden rounded-[var(--radius-xl2)] shadow-[0_44px_100px_-55px_rgba(15,32,42,0.5)] ring-1 ring-line lg:aspect-auto">
                      <Img
                        src="/images/jupyter-labs/jupyter-labs-origin-copenhagen-2019.webp"
                        alt="The founding of Jupyter Labs — the first peptide synthesis, Copenhagen 2019"
                        className="h-full w-full"
                        sizes="(min-width: 1024px) 48vw, 100vw"
                      />
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ───── WE DOCUMENT ───── */}
        <section className="relative overflow-hidden border-y border-line bg-section">
          <div className="pointer-events-none absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-[130px]" />
          <div className="container-x relative py-14 lg:py-20">
            <div className="grid gap-7 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-5">
                <span aria-hidden="true" className="mb-6 block h-px w-12 bg-accent-dark" />
                <Heading as="h2" title={'We document,\nnot just market.'} />
              </div>
              <Reveal delay={0.15} className="lg:col-span-7 lg:self-center">
                <p className="text-[1.05rem] leading-[1.6] text-muted text-pretty">
                  Every Jupyter Labs peptide is backed by a quality-focused process spanning sourcing, production,
                  testing, and packaging. Where applicable, batches undergo HPLC analysis and are supported by lot-level
                  documentation and clearly stated milligram specifications.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ───── OUR STANDARD ───── */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-sand/20 blur-[140px]" />
          <div className="container-x relative py-14 lg:py-20">
            <div className="flex items-center gap-4">
              <span className="h-px w-12 bg-accent-dark" />
              <p className="eyebrow">Our Standard</p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STANDARD.map((s, i) => (
                <Reveal
                  key={s.n}
                  delay={i * 0.08}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-card p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent-dark/30 hover:shadow-[0_30px_60px_-30px_rgba(121,13,22,0.4)] lg:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-accent-dark to-accent text-bg shadow-[0_10px_24px_-12px_rgba(121,13,22,0.7)] transition-transform duration-500 group-hover:scale-110">
                      <PillarIcon name={s.icon} />
                    </span>
                    <span className="font-display text-sm font-medium tracking-[0.1em] text-accent-dark/70 transition-colors duration-500 group-hover:text-accent-dark">
                      {s.n}
                    </span>
                  </div>

                  <div className="mt-12">
                    <h3 className="font-display text-[clamp(1.3rem,1.8vw,1.6rem)] font-medium leading-[1.1] tracking-[-0.02em] text-ink">
                      {s.t}.
                    </h3>
                    <p className="mt-2.5 text-[0.95rem] leading-[1.5] text-muted">{s.d}</p>
                  </div>

                  {/* Accent rail that draws in on hover — matches the site's pillar rows. */}
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-accent-dark via-accent to-transparent transition-transform duration-700 group-hover:scale-x-100" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───── CLOSING + RESEARCH USE ─────
            The research-use notice lives inside this section instead of in its
            own padded block below it, which was adding a full band of empty
            space for one line of small print. */}
        <section className="relative overflow-hidden border-t border-line bg-section">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[150px]" />
          <div className="container-x relative py-14 text-center lg:py-20">
            <Heading
              as="h2"
              align="center"
              title={'Science First.\nDocumentation Always.'}
              intro="Jupyter Labs exists to make peptide sourcing more transparent for modern research environments, with products built around clear information, documented quality, and accountability."
            />
            <Reveal delay={0.25}>
              <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <CtaLink to="/products" arrow>
                  Explore the catalogue
                </CtaLink>
                <CtaLink to="/contact" variant="outline">
                  Contact Us
                </CtaLink>
              </div>
            </Reveal>

            <p className="mx-auto mt-12 max-w-3xl border-t border-line pt-7 text-sm leading-[1.6] text-muted">
              <span className="text-ink">Research Use Only:</span> Jupyter Labs products are intended for laboratory
              research and R&amp;D purposes only and are not intended for human or veterinary consumption.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
