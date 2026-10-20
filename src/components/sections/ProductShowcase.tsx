import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from '../../lib/gsap'
import Heading from '../ui/Heading'
import Reveal from '../ui/Reveal'
import { PRODUCTS, SHOWCASE } from '../../lib/content'
import { formatPrice } from '../../lib/CartContext'
import { responsive } from '../../lib/responsiveImage'
import { useReducedMotion } from '../../lib/useReducedMotion'

/**
 * "Our products" — the tabbed box gallery directly under the hero.
 *
 * Layout and motion follow the product-selection section on
 * theobromachocolat.com: a heading with family tabs, and under it a full-bleed,
 * infinitely looping, drag-to-scroll row of product renders. The centred
 * render scales up to 1.5×, its neighbours are nudged outward, and the whole
 * band's background cross-fades to a nude tint of that box's artwork. One
 * call-to-action under the row always points at the centred product.
 */

type Family = (typeof SHOWCASE)[number]
type RawItem = Family['items'][number]

interface Item {
  key: string
  name: string
  tagline: string
  price?: string
  slug: string | null
  box: string
  accent: string
}

const LUX = [0.16, 1, 0.3, 1] as const

/** 18% of the box colour over the cream page background — enough to read as
 *  "that product", never enough to leave the site's nude palette. */
const tint = (accent: string) => `color-mix(in srgb, ${accent} 11%, var(--color-bg))`

function resolve(items: readonly RawItem[]): Item[] {
  return items.map((it) => {
    if (it.product) {
      const p = PRODUCTS.find((x) => x.id === it.product)!
      return {
        key: p.id,
        name: p.name,
        tagline: p.tagline,
        price: formatPrice(p.price, p.currency),
        slug: p.slug,
        box: it.box,
        accent: it.accent,
      }
    }
    return { key: it.box, name: it.name, tagline: it.tagline, slug: null, box: it.box, accent: it.accent }
  })
}

export default function ProductShowcase() {
  const reduced = useReducedMotion()
  const [tab, setTab] = useState(0)
  const [active, setActive] = useState(0)
  const family = SHOWCASE[tab]
  const items = useMemo(() => resolve(family.items), [family])
  const onActive = useCallback((i: number) => setActive(i), [])

  // The scroller remounts on a tab change and reports index 0 again; clamp
  // meanwhile so a stale index from a longer family can't read past the end.
  const cur = items[Math.min(active, items.length - 1)]

  return (
    <section
      id="our-products"
      aria-labelledby="our-products-title"
      // On desktop the whole section is sized to one viewport: header, flexing
      // scroller, footer. Card size and scroller padding are vh-based so the
      // 1.5× centred box still fits on a 16:9 laptop screen.
      className="relative z-10 -mt-10 flex flex-col overflow-x-clip rounded-t-[2.5rem] bg-[var(--ps-bg)] pb-10 pt-16 transition-[background-color] duration-[800ms] ease-[var(--ease-lux)] md:pb-8 md:pt-24 lg:min-h-[100svh]"
      style={{ '--ps-bg': tint(cur.accent), '--ps-accent': cur.accent } as CSSProperties}
    >
      {/* w-full: inside the section's column flexbox, container-x's auto side
          margins would otherwise shrink-wrap it to its content. */}
      <div className="container-x w-full">
        {/* Centred title, then one row: plain uppercase text tabs (the current
            one underlined) with a "Shop all" pill at the right. */}
        <div id="our-products-title">
          <Heading title={'Our products.'} align="center" className="!max-w-none [&_h2]:text-[clamp(1.35rem,0.9rem+1.7vw,2.1rem)]" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-5 md:mt-10 md:flex-row md:items-center md:justify-between">
          <div
            role="tablist"
            aria-label="Product families"
            className="flex flex-wrap justify-center gap-x-8 gap-y-3 md:gap-x-10 lg:gap-x-12"
          >
            {SHOWCASE.map((f, i) => (
              <Reveal key={f.id} delay={0.15 + i * 0.1} y={12} blur={false}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={i === tab}
                  onClick={() => {
                    setTab(i)
                    setActive(0)
                  }}
                  className={`group/tab relative py-1 font-sans text-[0.68rem] font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${
                    i === tab ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {f.label}
                  {/* Underline: full width when current, grows in from the left on hover otherwise. */}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-ink transition-transform duration-500 ease-[var(--ease-lux)] ${
                      i === tab ? 'scale-x-100' : 'scale-x-0 group-hover/tab:scale-x-100'
                    }`}
                  />
                </button>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.45} y={12} blur={false} className="md:shrink-0">
            <BlobButton to="/products" className="border-ink bg-ink text-bg !px-6 !py-2 !text-[0.68rem] !font-sans !font-medium !tracking-[0.14em]">
              Shop all
            </BlobButton>
          </Reveal>
        </div>
      </div>

      <BoxScroller key={family.id} items={items} onActive={onActive} reduced={reduced} />

      <div className="container-x flex w-full flex-col items-center text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cur.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: LUX }}
            aria-live="polite"
          >
            <p className="text-[0.52rem] uppercase tracking-[0.2em] text-muted">{cur.tagline}</p>
            <h3 className="mt-1 font-display text-base font-medium leading-[1.15] tracking-[-0.02em] text-ink lg:text-lg">
              {cur.name}
            </h3>
            {cur.price && <p className="mt-0.5 text-xs text-muted">{cur.price}</p>}
          </motion.div>
        </AnimatePresence>

        <div className="mt-4">
          {cur.slug ? (
            <BlobButton
              to={`/products/${cur.slug}`}
              className="border-ink bg-ink !px-6 !py-2 !text-[0.68rem] !font-sans !font-medium !tracking-[0.14em]"
              // Label takes the band's tint, as on the reference — the button
              // and the section "swap" colours as the centred product changes.
              style={{ color: 'var(--ps-bg)' }}
            >
              Explore in detail
            </BlobButton>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center rounded-full border border-ink/30 px-6 py-2 font-sans text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ink/50"
            >
              Coming soon
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────── blob-hover button ─────────────────────────── */

interface BlobProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  to?: string
  onClick?: () => void
  role?: string
  'aria-selected'?: boolean
}

/**
 * The reference's `.button`: a pill whose hover fill is an organic blob that
 * grows out from wherever the cursor entered (CSS --x/--y). Renders a <Link>
 * when `to` is given, else a <button>.
 */
function BlobButton({ children, className = '', style, to, onClick, ...aria }: BlobProps) {
  const classes =
    'group/blob relative isolate inline-flex items-center justify-center overflow-hidden rounded-full border px-6 py-3 font-serif text-[0.95rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-500 ease-[var(--ease-lux)] hover:text-bg ' +
    "after:absolute after:left-[var(--x,50%)] after:top-[var(--y,50%)] after:-z-10 after:aspect-square after:w-[200%] after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 after:rounded-[60%_40%_70%_30%/50%_60%_40%_50%] after:bg-accent-dark after:transition-transform after:duration-500 after:ease-[var(--ease-lux)] after:content-[''] hover:after:scale-105 " +
    className

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
  }

  if (to) {
    return (
      <Link to={to} className={classes} style={style} onMouseEnter={onMove} onMouseLeave={onMove} {...aria}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={classes} style={style} onClick={onClick} onMouseEnter={onMove} onMouseLeave={onMove} {...aria}>
      {children}
    </button>
  )
}

/* ─────────────────────────────── box scroller ─────────────────────────────── */

const AUTOPLAY_MS = 5000
const EASING = 0.06

interface ScrollerProps {
  items: Item[]
  onActive: (logicalIndex: number) => void
  reduced: boolean
}

/**
 * Infinite, eased, drag-to-scroll row — a port of the reference's scroller.
 *
 * The item list is laid out several times over; the track's offset is kept
 * inside one copy's width and wrapped when it leaves it, which is invisible
 * because the copies are identical. A virtual scroll position is what drag,
 * snap and autoplay write to; the rendered position eases toward it on GSAP's
 * ticker. Each frame also scales every card by its distance from the centre
 * (1.5× at centre, 1× one pitch away) and nudges neighbours outward by up to a
 * quarter card so the enlarged centre never overlaps them.
 */
function BoxScroller({ items, onActive, reduced }: ScrollerProps) {
  const navigate = useNavigate()
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [copies, setCopies] = useState(3)
  const [active, setActive] = useState(0)
  const n = items.length
  const all = useMemo(() => Array.from({ length: copies }, () => items).flat(), [items, copies])

  const s = useRef({
    virtual: 0,
    real: 0,
    center: 0,
    pitch: 0, // card width + gap
    elemW: 0,
    loopW: 0, // width of one copy of the list
    ready: false,
    centerIdx: -1, // physical index currently nearest the centre
    dragging: false,
    moved: 0,
    lastX: 0,
    inView: false,
    timer: 0 as ReturnType<typeof setTimeout> | 0,
  })

  // Signed distance from the viewport centre to physical element i's centre.
  const dist = useCallback((i: number, scroll: number) => {
    const st = s.current
    return st.center - (i * st.pitch - scroll + st.elemW / 2)
  }, [])

  const nearest = useCallback(
    (scroll: number) => {
      const total = n * copies
      let best = -1
      let bd = Infinity
      for (let i = 0; i < total; i++) {
        const d = Math.abs(dist(i, scroll))
        if (d < bd) {
          bd = d
          best = i
        }
      }
      return best
    },
    [n, copies, dist],
  )

  const clearTimer = () => {
    if (s.current.timer) clearTimeout(s.current.timer)
    s.current.timer = 0
  }

  // Autoplay re-arms itself after every settle, so the timeout needs the
  // latest `settle` without `settle` closing over itself.
  const settleRef = useRef<() => void>(() => {})
  const settle = useCallback(() => {
    const st = s.current
    const i = nearest(st.virtual)
    if (i >= 0) st.virtual -= dist(i, st.virtual)
    clearTimer()
    if (!reduced && st.inView) {
      st.timer = setTimeout(() => {
        s.current.virtual += s.current.pitch
        settleRef.current()
      }, AUTOPLAY_MS)
    }
  }, [nearest, dist, reduced])
  useEffect(() => {
    settleRef.current = settle
  }, [settle])

  const goTo = useCallback(
    (logical: number) => {
      const st = s.current
      const curIdx = nearest(st.virtual)
      // Of the physical copies of this item, pick the one nearest to where we are.
      let best = logical
      for (let k = logical; k < n * copies; k += n) if (Math.abs(k - curIdx) < Math.abs(best - curIdx)) best = k
      st.virtual += (best - curIdx) * st.pitch
      settle()
    },
    [nearest, settle, n, copies],
  )

  const measure = useCallback(() => {
    const w = wrap.current
    const t = track.current
    const first = t?.firstElementChild as HTMLElement | null
    if (!w || !t || !first) return
    const st = s.current
    st.center = w.clientWidth / 2
    st.elemW = first.offsetWidth
    st.pitch = st.elemW + (parseFloat(getComputedStyle(t).columnGap) || 0)
    st.loopW = st.pitch * n
    // Enough copies that the viewport is always full on both sides of the
    // wrap point, however few items a family has.
    const need = Math.max(3, Math.ceil(w.clientWidth / st.loopW) + 2)
    if (need !== copies) setCopies(need)

    if (!st.ready) {
      // Start with the first item centred in a middle copy, no ease-in.
      const idx = n * Math.floor(need / 2)
      st.virtual = idx * st.pitch + st.elemW / 2 - st.center
      st.real = st.virtual
      st.ready = true
    }
  }, [n, copies])

  useEffect(() => {
    measure()
    const ro = new ResizeObserver(() => {
      measure()
      settle()
    })
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [measure, settle])

  // Autoplay only while on screen.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      s.current.inView = e.isIntersecting
      if (e.isIntersecting) settle()
      else clearTimer()
    })
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimer()
    }
  }, [settle])

  // Per-frame: ease, wrap, place the track, scale/nudge the cards, track the centre.
  useEffect(() => {
    const render = () => {
      const st = s.current
      const t = track.current
      if (!t || !st.ready) return
      if (!st.inView && Math.abs(st.virtual - st.real) < 0.5) return

      const k = reduced ? 1 : 1 - Math.pow(1 - EASING, gsap.ticker.deltaRatio())
      st.real += (st.virtual - st.real) * k
      if (st.real < 0) {
        st.virtual += st.loopW
        st.real += st.loopW
      } else if (st.real > st.loopW) {
        st.virtual -= st.loopW
        st.real -= st.loopW
      }
      t.style.transform = `translate3d(${-st.real}px,0,0)`

      const push = st.elemW / 4
      const cards = t.children
      const ci = nearest(st.virtual)
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement
        const d = dist(i, st.real)
        const tt = Math.abs(d) / st.pitch
        const scale = 1 + Math.max(0, 0.5 - tt * 0.5)
        const x = Math.min(push, tt * push) * -Math.sign(d)
        ;(card.firstElementChild as HTMLElement).style.transform = `translate3d(${x}px,0,0) scale(${scale})`
      }
      if (ci !== st.centerIdx) {
        st.centerIdx = ci
        const logical = ((ci % n) + n) % n
        setActive(logical)
        onActive(logical)
      }
    }
    gsap.ticker.add(render)
    return () => gsap.ticker.remove(render)
  }, [nearest, dist, onActive, n, reduced])

  // Drag. Pointer events cover mouse + touch; touch-action: pan-y keeps the
  // page scrolling vertically through the row.
  const onPointerDown = (e: React.PointerEvent) => {
    const st = s.current
    st.dragging = true
    st.moved = 0
    st.lastX = e.clientX
    clearTimer()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const st = s.current
    if (!st.dragging) return
    const dx = (st.lastX - e.clientX) * (window.innerWidth > 768 ? 1 : 2)
    st.virtual += dx
    st.moved += Math.abs(dx)
    st.lastX = e.clientX
  }
  const onPointerUp = () => {
    const st = s.current
    if (!st.dragging) return
    st.dragging = false
    settle()
  }

  const onCardClick = (physical: number) => {
    const st = s.current
    if (st.moved > 6) return // that was a drag, not a click
    const item = items[physical % n]
    if (physical === st.centerIdx) {
      if (item.slug) navigate(`/products/${item.slug}`)
    } else {
      goTo(physical % n)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      s.current.virtual += s.current.pitch
      settle()
    } else if (e.key === 'ArrowLeft') {
      s.current.virtual -= s.current.pitch
      settle()
    }
  }

  return (
    <>
      <div
        ref={wrap}
        data-cursor
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${items.length} products — drag or use arrow keys to browse`}
        className="relative flex flex-1 cursor-ew-resize select-none items-center overflow-hidden py-14 outline-none [touch-action:pan-y] focus-visible:ring-2 focus-visible:ring-accent-dark/50 md:py-[clamp(2.5rem,7vh,6rem)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div ref={track} className="flex w-max gap-12 will-change-transform md:gap-24">
          {all.map((item, i) => (
            <div
              key={`${item.key}-${i}`}
              className="relative h-[56vw] w-[56vw] shrink-0 md:h-[clamp(230px,31vh,380px)] md:w-[clamp(290px,40vh,490px)]"
              onClick={() => onCardClick(i)}
              aria-hidden={i % n !== 0 || i >= n ? true : undefined}
            >
              {/* Transformed per frame by the ticker (firstElementChild). */}
              {/* No will-change here: it would pin this layer's raster scale at
                  1×, and the compositor would then stretch that bitmap to 1.5×
                  for the centred box — visibly soft. Without it the browser
                  re-rasterises at the real scale. (The track keeps its own
                  will-change; it only translates.) */}
              <div className="absolute inset-1 isolate">
                {/* Three concentric arches, bases aligned, standing behind the
                    box. Tone-on-tone: the product's spiral colour mixed into the
                    darker nude tan (the band behind is the same colour on
                    cream), each step in a little deeper, so the stack reads as
                    one layered shape a shade darker than its background. */}
                <div aria-hidden="true" className="absolute inset-0 -z-10">
                  {[
                    { r: 1.15, h: '90%', mix: 14 },
                    { r: 1.0, h: '75%', mix: 22 },
                    { r: 0.85, h: '60%', mix: 30 },
                  ].map((a) => (
                    <span
                      key={a.h}
                      className="absolute bottom-[14%] left-1/2 -translate-x-1/2 rounded-t-full"
                      style={{
                        // Width follows height (cards are wider than tall), so
                        // the arches keep their proportions at any card width.
                        height: a.h,
                        aspectRatio: a.r,
                        background: `color-mix(in srgb, ${item.accent} ${a.mix}%, var(--color-bg-deep))`,
                      }}
                    />
                  ))}
                </div>
                <img
                  src={item.box}
                  {...responsive(item.box, '(min-width: 768px) 720px, 90vw')}
                  alt={`${item.name} — Alluvi research device box`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="pointer-events-none h-full w-full translate-y-[10%] select-none object-contain drop-shadow-[0_24px_40px_rgba(42,15,18,0.18)]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots — one per item; the current one stretches, as on the reference. */}
      <div className="mb-4 flex justify-center gap-2" role="tablist" aria-label="Products in this family">
        {items.map((item, i) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={item.name}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-[width,background-color] duration-[600ms] ease-[var(--ease-lux)] ${
              i === active ? 'w-5 bg-accent-dark' : 'w-2 bg-ink/15 hover:bg-ink/30'
            }`}
          />
        ))}
      </div>
    </>
  )
}
