import { useRef, type ElementType, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import SplitType from 'split-type'
import { gsap } from '../../lib/gsap'
import { useReducedMotion } from '../../lib/useReducedMotion'

type Mode = 'chars' | 'words' | 'lines'

interface Props {
  children: ReactNode
  as?: ElementType
  className?: string
  mode?: Mode
  /** stagger seconds */
  stagger?: number
  delay?: number
  /** blur-to-sharp entrance */
  blur?: boolean
  start?: string
  /** play immediately rather than on scroll */
  immediate?: boolean
}

/**
 * Editorial split-text reveal. Splits into chars/words/lines and animates each
 * with a staggered rise + blur-to-sharp transition, driven by ScrollTrigger.
 */
export default function SplitReveal({
  children,
  as: Tag = 'div',
  className = '',
  mode = 'words',
  stagger = 0.05,
  delay = 0,
  blur = true,
  start = 'top 85%',
  immediate = false,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced || !ref.current) return
      const split = new SplitType(ref.current, {
        types: mode === 'lines' ? 'lines' : mode === 'words' ? 'words' : 'words,chars',
        tagName: 'span',
      })
      const targets =
        mode === 'chars' ? split.chars : mode === 'words' ? split.words : split.lines
      if (!targets) return

      gsap.set(targets, { display: mode === 'lines' ? 'block' : 'inline-block' })

      gsap.from(targets, {
        yPercent: 115,
        opacity: 0,
        filter: blur ? 'blur(12px)' : 'blur(0px)',
        rotateX: mode === 'lines' ? -35 : 0,
        duration: 1.05,
        ease: 'power4.out',
        stagger,
        delay,
        scrollTrigger: immediate
          ? undefined
          : { trigger: ref.current, start, once: true },
      })

      return () => split.revert()
    },
    { scope: ref, dependencies: [reduced] },
  )

  const Component = Tag
  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  )
}
