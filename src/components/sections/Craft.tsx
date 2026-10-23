import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Heading from '../ui/Heading'
import Img from '../ui/Img'
import CardBackdrop from '../ui/CardBackdrop'
import { useReducedMotion } from '../../lib/useReducedMotion'

const PILLARS = [
  { t: 'Carefully Sourced Ingredients', d: 'Qualified suppliers and trusted laboratories, with documented origins and consistent quality.' },
  { t: 'Independently Tested', d: 'Every compound is tested for identity, purity and potency throughout quality control.' },
  { t: 'Precision-Focused Production', d: 'Controlled production runs give close oversight of every pen, from manufacture to shipment.' },
  { t: 'Temperature Controlled Packaging', d: 'Packaged for stability, protecting each pen from environmental exposure from production to your bench.' },
]

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setDesktop(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return desktop
}

function Pillar({ index, desktop, reduced, shift, show, wrapRef }: { index: number; side: 'left' | 'right'; desktop: boolean; reduced: boolean; shift: number; show: boolean; wrapRef: (el: HTMLDivElement | null) => void }) {
  const p = PILLARS[index]
  // Desktop: slide out from behind the image. Mobile: simple rise-in.
  const hidden = reduced
    ? { opacity: 1 }
    : desktop
      ? { opacity: 1, x: shift, scale: 0.9 }
      : { opacity: 0, y: 24 }
  const shown = { opacity: 1, x: 0, y: 0, scale: 1 }
  return (
    <div ref={wrapRef}>
    <motion.div
      initial={hidden}
      animate={show ? shown : hidden}
      transition={show ? { duration: 1.1, delay: 0.15 + (index % 2) * 0.12, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
      className="group relative overflow-hidden rounded-2xl bg-bg p-5 shadow-[0_18px_40px_-26px_rgba(42,15,18,0.3)] transition-shadow duration-500 hover:shadow-[0_18px_40px_-18px_rgba(42,15,18,0.35)]"
    >
      <div className="flex items-start gap-4">
        <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-dark to-accent text-bg shadow-[0_8px_20px_-8px_rgba(121,13,22,0.5)] transition-transform duration-500 group-hover:scale-110">
          <span className="font-display text-[0.65rem] font-medium tracking-tight">0{index + 1}</span>
          <span className="absolute inset-0 rounded-full ring-1 ring-bg/15" />
        </div>
        <div className="flex-1 pt-1">
          <h3 className="font-display text-base font-medium leading-[1.2] text-ink">{p.t}</h3>
          <p className="mt-1.5 text-sm leading-[1.5] text-muted">{p.d}</p>
        </div>
      </div>
      <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-accent-dark via-accent to-transparent transition-all duration-700 group-hover:w-full" />
    </motion.div>
    </div>
  )
}

/** Thin, curved arrows from the image edge to each point (desktop only). */
function useArrows(desktop: boolean) {
  const box = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLDivElement | null)[]>([])
  const [arrows, setArrows] = useState<{ d: string }[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [shifts, setShifts] = useState<number[]>([0, 0, 0, 0])
  const inView = useInView(box, { amount: 0.3 })

  const measure = useCallback(() => {
    const b = box.current, i = img.current
    if (!desktop || !b || !i) { setArrows([]); return }
    const br = b.getBoundingClientRect(), ir = i.getBoundingClientRect()
    const out: { d: string }[] = []
    const sh: number[] = []
    const icx = (ir.left + ir.right) / 2
    cards.current.forEach((el, n) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const left = n < 2
      // Distance that parks the card's centre on the image's centre (fully hidden behind it).
      sh[n] = icx - (r.left + r.right) / 2
      // Hand-drawn style flourishes, one per card (see the traced reference).
      const sx = (left ? ir.left : ir.right) - br.left + (left ? -2 : 2)
      const sy = ir.top - br.top + ir.height * [0.2, 0.59, 0.31, 0.53][n]
      const cx = (r.left - br.left) + r.width * [0.64, 0.6, 0.3, 0.26][n]
      // Stop short of the card so the arrowhead never touches or overlaps it.
      const top = r.top - br.top - 14
      const bottom = r.bottom - br.top + 16
      // Control-point height so a cubic whose endpoints are y0/y1 peaks at `peak`.
      const ctrl = (y0: number, y1: number, peak: number) => (peak - 0.125 * (y0 + y1)) / 0.75
      let d: string
      if (n === 0) {
        // Over the top, then down onto the card's top edge.
        const c = ctrl(sy, top, ir.top - br.top + 25)
        d = `M${sx} ${sy} C${sx - 70} ${c}, ${cx + 10} ${c}, ${cx} ${top}`
      } else if (n === 1) {
        // Down and round underneath, finishing at the card's bottom edge.
        d = `M${sx} ${sy} C${sx + 4} ${bottom - 40}, ${cx + 110} ${bottom + 14}, ${cx} ${bottom}`
      } else if (n === 2) {
        // Up and over, down onto the card's top-left.
        const c = ctrl(sy, top, ir.top - br.top + 45)
        d = `M${sx} ${sy} C${sx + 30} ${c}, ${cx - 30} ${c}, ${cx} ${top}`
      } else {
        // Sweep across the gap and land on the card's left edge, pointing straight at it.
        const ex = r.left - br.left - 14
        const ey = (r.top + r.bottom) / 2 - br.top
        d = `M${sx} ${sy} C${sx + 50} ${sy + 60}, ${ex - 50} ${ey - 40}, ${ex} ${ey}`
      }
      out.push({ d })
    })
    setSize({ w: br.width, h: br.height })
    setArrows(out)
    setShifts(sh)
  }, [desktop])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (box.current) ro.observe(box.current)
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [measure])

  return { box, img, cards, arrows, size, shifts, inView }
}

export default function Craft() {
  const desktop = useIsDesktop()
  const reduced = useReducedMotion()
  const { box, img, cards, arrows, size, shifts, inView } = useArrows(desktop)
  const ref = (n: number) => (el: HTMLDivElement | null) => { cards.current[n] = el }

  return (
    <section id="craft" className="relative overflow-x-clip bg-[#fdfcf8] py-16 lg:py-28">
      <div className="container-x">
        <Heading
          align="center"
          eyebrow="How We Make It"
          eyebrowGap="mb-5"
          className="[&_h2]:text-balance [&_h2]:text-[clamp(1.35rem,0.9rem+1.7vw,2.1rem)] [&_.eyebrow]:text-[0.8rem]"
          title={'Crafted with\nuncompromising precision.'}
        />

        <div ref={box} className="relative mt-10 grid items-center gap-5 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)_minmax(0,1fr)] lg:gap-x-24 xl:gap-x-28">
          {/* Image: centre on desktop, first on mobile. z-10 so cards emerge from behind it. */}
          <div ref={img} className="relative isolate z-10 order-first mx-auto w-full max-w-[30rem] lg:order-none lg:col-start-2 lg:row-start-1">
            <CardBackdrop flip />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl2)]">
              <div className="absolute inset-0">
                <Img
                  src="/images/ecom/craft-tesamorelin.webp"
                  alt="Woman in a coral t-shirt holding an Alluvi Tesamorelin pen toward the camera against a warm beige backdrop"
                  sizes="(min-width: 1024px) 700px, 90vw"
                  className="h-full w-full"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-accent-dark/10 via-transparent to-transparent" />
            </div>
          </div>

          {desktop && size.w > 0 && (
            <motion.svg
              aria-hidden
              width={size.w}
              height={size.h}
              viewBox={`0 0 ${size.w} ${size.h}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: inView || reduced ? 1 : 0 }}
              transition={inView && !reduced ? { duration: 0.8, delay: 1.1 } : { duration: reduced ? 0 : 0.3 }}
              className="pointer-events-none absolute inset-0 z-[1] overflow-visible text-[#5a1f26]"
            >
              <defs>
                <marker id="craft-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M1 1 9 5 1 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              </defs>
              {arrows.map((a, i) => (
                <path key={i} d={a.d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 7" markerEnd="url(#craft-arrow)" />
              ))}
            </motion.svg>
          )}

          <div className="relative z-[2] flex flex-col gap-5 lg:col-start-1 lg:row-start-1 lg:gap-8">
            <Pillar index={0} side="left" desktop={desktop} reduced={reduced} shift={shifts[0]} show={inView} wrapRef={ref(0)} />
            <Pillar index={1} side="left" desktop={desktop} reduced={reduced} shift={shifts[1]} show={inView} wrapRef={ref(1)} />
          </div>

          <div className="relative z-[2] flex flex-col gap-5 lg:col-start-3 lg:row-start-1 lg:gap-8">
            <Pillar index={2} side="right" desktop={desktop} reduced={reduced} shift={shifts[2]} show={inView} wrapRef={ref(2)} />
            <Pillar index={3} side="right" desktop={desktop} reduced={reduced} shift={shifts[3]} show={inView} wrapRef={ref(3)} />
          </div>
        </div>
      </div>
    </section>
  )
}
