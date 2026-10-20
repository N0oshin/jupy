import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useReducedMotion } from '../../lib/useReducedMotion'

/**
 * Layered, tilted nude cards that sit behind a photo card and drift as the
 * page scrolls — each layer moves and rotates at its own rate, so the stack
 * fans open and closes as the section passes through the viewport.
 *
 * Render it as the first child of a `relative isolate` wrapper that also
 * contains the photo; it positions itself behind the photo (-z-10) and is
 * sized to match the wrapper, so its corners peek out around the photo.
 *
 * Hovering the photo card plays the same motion: a spring (0 → 1) pushes each
 * layer along its own travel and spin, so the stack fans open under the cursor
 * and eases back when it leaves.
 *
 * `flip` mirrors the tilt directions for the section on the other side of the
 * page, so adjacent sections don't lean the same way.
 */

interface Layer {
  /** resting rotation, degrees */
  rotate: number
  /** extra rotation reached at the end of the scroll range */
  spin: number
  /** horizontal offset, % of card width */
  x: number
  /** vertical travel across the scroll range, px (± this value) */
  travel: number
  /** inset from the card edge, % */
  inset: number
  /** background colour */
  color: string
}

const LAYERS: Layer[] = [
  { rotate: -7, spin: 5, x: -5, travel: 46, inset: 0, color: 'color-mix(in srgb, var(--color-bg-deep) 45%, #fdfcf8)' },
  { rotate: 6, spin: -5, x: 6, travel: -34, inset: 2, color: 'color-mix(in srgb, var(--color-bg-deep) 80%, #fdfcf8)' },
  { rotate: -2, spin: 3, x: 0, travel: 18, inset: 4, color: 'color-mix(in srgb, var(--color-bg-deep) 100%, var(--color-accent-dark) 8%)' },
]

function Sheet({ layer, progress, hover, flip }: { layer: Layer; progress: MotionValue<number>; hover: MotionValue<number>; flip: boolean }) {
  const s = flip ? -1 : 1
  const y = useTransform([progress, hover], ([p, h]: number[]) => layer.travel * (1 - 2 * p) - layer.travel * 1.1 * h)
  const rotate = useTransform([progress, hover], ([p, h]: number[]) => (layer.rotate + layer.spin * (p + 1.2 * h)) * s)
  return (
    <motion.div
      aria-hidden="true"
      className="absolute rounded-[var(--radius-xl2)]"
      style={{
        inset: `${layer.inset}%`,
        x: `${layer.x * s}%`,
        y,
        rotate,
        background: layer.color,
        boxShadow: '0 24px 50px -30px rgba(42,15,18,0.35)',
      }}
    />
  )
}

export default function CardBackdrop({ flip = false }: { flip?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  // Hover on the photo card (this element's parent) drives a 0 → 1 spring.
  const hoverRaw = useMotionValue(0)
  const hover = useSpring(hoverRaw, { stiffness: 120, damping: 18 })
  useEffect(() => {
    const card = ref.current?.parentElement
    if (!card || reduced) return
    const on = () => hoverRaw.set(1)
    const off = () => hoverRaw.set(0)
    card.addEventListener('mouseenter', on)
    card.addEventListener('mouseleave', off)
    return () => {
      card.removeEventListener('mouseenter', on)
      card.removeEventListener('mouseleave', off)
    }
  }, [hoverRaw, reduced])

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {LAYERS.map((l, i) =>
        reduced ? (
          <div
            key={i}
            className="absolute rounded-[var(--radius-xl2)]"
            style={{
              inset: `${l.inset}%`,
              transform: `translateX(${l.x * (flip ? -1 : 1)}%) rotate(${l.rotate * (flip ? -1 : 1)}deg)`,
              background: l.color,
            }}
          />
        ) : (
          <Sheet key={i} layer={l} progress={scrollYProgress} hover={hover} flip={flip} />
        ),
      )}
    </div>
  )
}
