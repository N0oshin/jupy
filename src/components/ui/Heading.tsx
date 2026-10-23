import SplitReveal from './SplitReveal'
import Reveal from './Reveal'

interface Props {
  eyebrow?: string
  title: string
  intro?: string
  align?: 'left' | 'center' | 'right'
  className?: string
  light?: boolean
  /** Tailwind margin-bottom class for the eyebrow → controls the gap before the title. */
  eyebrowGap?: string
  /**
   * Heading level to render. Defaults to h2, which is correct for the section
   * headings this component was built for. Pages that use it as their single
   * page title (e.g. /shop, /contact) pass "h1" so the document has exactly one
   * top-level heading — the visual styling is identical either way.
   */
  as?: 'h1' | 'h2'
  /** Extra classes for the intro paragraph, e.g. to restyle it for one page. */
  introClassName?: string
}

/** Reusable editorial section heading: eyebrow + split-reveal title + intro. */
export default function Heading({ eyebrow, title, intro, align = 'left', className = '', light = false, eyebrowGap = 'mb-4', as = 'h2', introClassName = '' }: Props) {
  const center = align === 'center'
  const right = align === 'right'
  return (
    <div className={`${center ? 'mx-auto max-w-2xl text-center' : right ? 'ml-auto max-w-2xl text-right' : 'max-w-2xl'} ${className}`}>
      {eyebrow && (
        <Reveal>
          <p className={`eyebrow ${eyebrowGap} ${light ? '!text-gold' : ''}`}>{eyebrow}</p>
        </Reveal>
      )}
      <SplitReveal
        as={as}
        mode="lines"
        stagger={0.12}
        className={`type-section font-display font-medium leading-[1.08] tracking-[-0.015em] ${light ? 'text-bg' : 'text-ink'}`}
      >
        {title}
      </SplitReveal>
      {intro && (
        <Reveal delay={0.15}>
          <p className={`type-sub mt-5 max-w-xl text-pretty ${light ? 'text-bg/70' : 'text-muted'} ${center ? 'mx-auto' : right ? 'ml-auto' : ''} ${introClassName}`}>
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  )
}
