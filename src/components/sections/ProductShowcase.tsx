import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from '../../lib/gsap'
import Heading from '../ui/Heading'
import Reveal from '../ui/Reveal'
import { PRODUCTS, SHOWCASE } from '../../lib/content'
import { formatPrice } from '../../lib/format'
import { responsive } from '../../lib/responsiveImage'
import { useReducedMotion } from '../../lib/useReducedMotion'

/**
 * "Our products" — the tabbed box gallery directly under the hero.
 *
 * Layout and motion follow the product-selection section on
 * theobromachocolat.com: a heading with family tabs, and under it a full-bleed,
 * infinitely looping, drag-to-scroll row of product renders. The centred
 * render scales up to 1.5×, its neighbours are nudged outward, and each card
 * is a plain solid tile in a nude tint of its box's artwork, with the name,
 * tagline and an "Explore" cue set inside it. One
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

/** 11% of the box colour over the cream background — the nude tint the
 *  section band takes for the centred product, enough to read as "that
 *  product", never enough to leave the site's nude palette. */
const tint = (accent: string) => `color-mix(in srgb, ${accent} 11%, #fdfcf8)`

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
    return {
      key: it.box,
      name: it.name,
      tagline: it.tagline,
      slug: null,
      box: it.box,
      accent: it.accent,
    }
  })
}

export default function ProductShowcase() {
  const reduced = useReducedMotion()
  // Opens on "All products" so every box is in the scroller by default; the
  // category tabs narrow it from there.
  const [tab, setTab] = useState(() =>
    Math.max(
      0,
      SHOWCASE.findIndex((f) => f.id === 'all'),
    ),
  )
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
      className="relative z-10 -mt-10 flex flex-col overflow-x-clip rounded-t-[2.5rem] bg-bg pb-20 pt-24 md:pb-20 md:pt-32"
      style={
        {
          '--ps-bg': tint(cur.accent),
          '--ps-accent': cur.accent,
        } as CSSProperties
      }
    >
      {/* Section backdrop: a lightly blurred photo behind everything. Scaled up
          inside a clipped wrapper so the blur has no soft edge. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-t-[2.5rem]">
        <img
          src="/images/ecom/bg/bg7.png"
          alt=""
          decoding="async"
          draggable={false}
          className="h-full w-full scale-110 object-cover blur-[6px]"
        />
      </div>

      {/* w-full: inside the section's column flexbox, container-x's auto side
          margins would otherwise shrink-wrap it to its content. */}
      <div className="container-x w-full">
        {/* Centred title, then one row: plain uppercase text tabs (the current
            one underlined) with a "Shop all" pill at the right. */}
        <div id="our-products-title">
          <Heading title={'Our products'} align="center" className="!max-w-none [&_h2]:text-[clamp(1.35rem,0.9rem+1.7vw,2.1rem)]" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-5 md:mt-10 md:flex-row md:items-center md:justify-between">
          <div
            role="tablist"
            aria-label="Product categories"
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
            {/* Follows the current tab into the filtered catalogue. */}
            <BlobButton
              to={family.id === 'all' ? '/products' : `/products?category=${family.id}`}
              className="border-ink bg-ink text-bg !px-6 !py-2 !text-[0.68rem] !font-sans !font-medium !tracking-[0.14em]"
            >
              {family.id === 'all' ? 'Shop all' : `Shop ${family.label}`}
            </BlobButton>
          </Reveal>
        </div>
      </div>

      {/* The row, its dots and the call-to-action move as one group, centred
          in whatever height the section has left, so the dots and button stay
          tight under the cards instead of the row floating away from them. */}
      <div className="my-auto flex w-full flex-col">
        <BoxScroller key={family.id} items={items} onActive={onActive} reduced={reduced} />

        <div className="container-x flex w-full flex-col items-center text-center">
          {/* The name and tagline live inside each tile now; only the
            call-to-action for the centred product sits under the row. */}
          <div className="mt-1">
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

/** Continuous leftward drift, in px per 60fps frame (≈ 30px/s), and the pause
 *  after the visitor interacts before it resumes. */
const DRIFT_PX = 0.5
const RESUME_MS = 1500
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
 * (visually 1.5× at centre, 1× one pitch away; the tile is laid out at the
 * centred size and scaled down, so it is never upscaled) and nudges neighbours outward by up to a
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
    resumeAt: 0, // time the drift may resume after an interaction
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

  // Snap to the nearest card after a drag, key press or dot click, then let
  // the continuous drift pick up again after a short pause.
  const settle = useCallback(() => {
    const st = s.current
    const i = nearest(st.virtual)
    if (i >= 0) st.virtual -= dist(i, st.virtual)
    st.resumeAt = performance.now() + RESUME_MS
  }, [nearest, dist])

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

  // Drift only while on screen.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      s.current.inView = e.isIntersecting
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Per-frame: ease, wrap, place the track, scale/nudge the cards, track the centre.
  useEffect(() => {
    const render = () => {
      const st = s.current
      const t = track.current
      if (!t || !st.ready) return
      if (!st.inView && Math.abs(st.virtual - st.real) < 0.5) return

      const ratio = gsap.ticker.deltaRatio()
      const drifting = !reduced && st.inView && !st.dragging && performance.now() >= st.resumeAt
      if (drifting) st.virtual += DRIFT_PX * ratio

      const k = reduced ? 1 : 1 - Math.pow(1 - EASING, ratio)
      st.real += (st.virtual - st.real) * k
      // Snap the asymptotic tail so the transforms stop changing once the
      // row has settled; a layer whose transform keeps moving is never
      // re-rasterised at its true scale, which is what blurs text.
      if (!drifting && Math.abs(st.virtual - st.real) < 0.05) st.real = st.virtual
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
        // The tile is laid out at 1.5× the slot, so the centred tile is
        // scale 1 and a neighbour one pitch away is 1/1.5 — scaled down,
        // never up (see the tile markup).
        const scale = (1 + Math.max(0, 0.5 - tt * 0.5)) / 1.5
        const x = Math.min(push, tt * push) * -Math.sign(d)
        const inner = card.firstElementChild as HTMLElement
        inner.style.transform = `translate3d(${x}px,0,0) scale(${scale})`
        // 1 at the centre, 0 one pitch away — drives the box's lift shadow and
        // ground shadow in CSS so the centred product reads as raised off the band.
        inner.style.setProperty('--focus', String(Math.max(0, 1 - tt).toFixed(3)))
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
        className="relative flex cursor-ew-resize select-none items-center overflow-x-clip py-24 outline-none [touch-action:pan-y] focus-visible:ring-2 focus-visible:ring-accent-dark/50 md:py-[clamp(5rem,14vh,10rem)]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div ref={track} className="flex w-max gap-1 will-change-transform md:gap-2">
          {all.map((item, i) => (
            <div
              key={`${item.key}-${i}`}
              className="relative h-[46vw] w-[64vw] shrink-0 md:h-[clamp(195px,26.5vh,320px)] md:w-[clamp(330px,46vh,560px)]"
              onClick={() => onCardClick(i)}
              aria-hidden={i % n !== 0 || i >= n ? true : undefined}
            >
              {/* Transformed per frame by the ticker (firstElementChild). */}
              {/* The tile is laid out at the full centred size (1.5× the card
                  slot, hence the -25% inset) and the ticker scales it DOWN for
                  the neighbours, never up. Text and artwork are therefore
                  always rasterised at or above the size they appear, so the
                  centred tile stays crisp instead of being a 1× bitmap
                  stretched by the compositor. */}
              <div
                className="absolute -inset-[25%] isolate overflow-hidden [--focus:0]"
              >
                {/* A plain solid tile in the product's nude tint, with the
                    details set inside it: name and tagline top-left, the box
                    and the box centred in the lower part of the tile. */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-[7%]">
                  {/* The box and its veil lift together. The veil is a sheet
                      of the section's cream, masked to the box's own silhouette,
                      so the artwork reads softer and less saturated. */}
                  <div className="w-[78%]">
                    <div className="box-lift relative w-full">
                      <img
                        src={item.box}
                        {...responsive(item.box, '(min-width: 768px) 720px, 90vw')}
                        alt={`${item.name} — Alluvi research device box`}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="pointer-events-none block h-auto w-full select-none"
                      />
                      <span
                        aria-hidden="true"
                        className="box-veil pointer-events-none absolute inset-0"
                        style={{
                          WebkitMaskImage: `url(${item.box})`,
                          maskImage: `url(${item.box})`,
                        }}
                      />
                    </div>
                  </div>
                  {/* Name and details sit directly under the box, so the box
                      and its text always read as one centred group. */}
                  <div className="mt-[6%] text-center">
                    <h4 className="font-display text-[clamp(0.95rem,2.6vw,1.15rem)] font-medium leading-[1.15] tracking-[-0.02em] text-ink">
                      {item.name}
                    </h4>
                    <p className="mt-1.5 text-[clamp(0.72rem,1.95vw,0.9rem)] leading-snug text-muted">{item.tagline}</p>
                    {item.price && (
                      <p className="mt-1.5 font-display text-[clamp(0.85rem,2.2vw,1rem)] text-ink">{item.price}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots — one per item; the current one stretches, as on the reference. */}
      <div className="mb-4 mt-8 flex justify-center gap-2" role="tablist" aria-label="Products in this family">
        {items.map((item, i) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={item.name}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-[width,background-color] duration-[600ms] ease-[var(--ease-lux)] ${i === active ? 'w-5 bg-accent-dark' : 'w-2 bg-ink/15 hover:bg-ink/30'}`}
          />
        ))}
      </div>
    </>
  )
}
