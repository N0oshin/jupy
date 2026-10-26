import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

/**
 * Custom luxury cursor: a small dot + a lagging ring that grows over
 * interactive elements (anything with [data-cursor] or a/button).
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const reduced = useReducedMotion()
  // Pointer type is a static device trait, so read it once at mount.
  const [pointerFine] = useState(() => window.matchMedia('(pointer: fine)').matches)
  const enabled = !reduced && pointerFine

  useEffect(() => {
    if (!enabled) return
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { ...target }
    let hovered: EventTarget | null = null
    let raf = 0

    // mousemove can fire faster than the display refreshes. The handler only
    // records state; every style write and the `closest()` walk happen once per
    // frame in the loop below, so a burst of events costs one hit-test, not one
    // per event.
    const move = (e: MouseEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      hovered = e.target
    }

    const loop = () => {
      if (dot.current) {
        dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`
      }
      ringPos.x += (target.x - ringPos.x) * 0.16
      ringPos.y += (target.y - ringPos.y) * 0.16
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`
      }
      if (hovered) {
        // setHover with an unchanged value is a no-op in React, so this only
        // re-renders when the cursor actually crosses an interactive boundary.
        setHover(!!(hovered as HTMLElement).closest('a, button, [data-cursor]'))
        hovered = null
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', move, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[90] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-accent-dark mix-blend-multiply"
      />
      <div
        ref={ring}
        className={`pointer-events-none fixed left-0 top-0 z-[90] grid place-items-center rounded-full border border-accent-dark/40 transition-[width,height,opacity] duration-300 ${
          hover ? 'h-11 w-11 bg-accent-dark/5' : 'h-6 w-6'
        }`}
        style={{ marginLeft: hover ? -22 : -12, marginTop: hover ? -22 : -12 }}
      />
    </>
  )
}
