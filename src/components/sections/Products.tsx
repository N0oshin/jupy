import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Heading from "../ui/Heading";
import { PRODUCTS } from "../../lib/content";
import { formatPrice } from "../../lib/CartContext";
import { responsive } from "../../lib/responsiveImage";
import { useReducedMotion } from "../../lib/useReducedMotion";

/**
 * Featured Compounds — one folded card with the other products' pens either side.
 *
 * The card is a two-panel "device" hinged at its centre crease. At rest the left
 * panel is folded over the right one, so only its back — the closed cover, with
 * the product's pen — shows. While the pointer is on the stage the left panel
 * swings open to show the box on one page and the details on the other.
 * Hovering or tapping a side pen swaps that product into the card.
 *
 *  below is a placeholder render. Swap each for the final featured image.
 */
const FEATURED = [
  {
    id: "bpc-157",
    box: "/images/products/boxes/bpc-157.webp",
    pen: "/images/products/pens/bpc-157.webp",
    accent: "#2fa84f",
  },
  {
    id: "retatrutide-20",
    box: "/images/products/boxes/retatrutide-20.webp",
    pen: "/images/products/pens/retatrutide-20.webp",
    accent: "#f08a1c",
  },
  {
    id: "retatrutide",
    box: "/images/products/boxes/retatrutide-40.webp",
    pen: "/images/products/pens/retatrutide-40.webp",
    accent: "#f5a82a",
  },
] as const;

type Product = (typeof PRODUCTS)[number];
interface Item {
  p: Product;
  box: string;
  /** the pen shown on the closed cover */
  pen: string;
  accent: string;
}
const ITEMS: Item[] = FEATURED.map((f) => ({
  p: PRODUCTS.find((x) => x.id === f.id)!,
  box: f.box,
  pen: f.pen,
  accent: f.accent,
}));

/** Border width of the device, px. The panels overlap by exactly this so the crease is a single line. */
const BW = 1;
const BORDER = "border-[#c4c7cc]";

export default function Products() {
  const reduced = useReducedMotion();
  return (
    <section
      id="products"
      aria-label="Featured compounds"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#d6e0e9] pb-12 pt-24 md:pt-28"
    >
      <Header />

      <div className="relative flex flex-col">
        {/* Frosted-glass stage behind the intro and the cards: wider than them, rounded,
            a shade darker than the section, so the whole showcase sits on it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-3 -top-3 left-1/2 w-[min(1552px,100vw)] -translate-x-1/2 rounded-[2.25rem] border border-white/45 bg-gradient-to-b from-[#9fb0bd]/60 to-[#8a9ba8]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_30px_60px_-30px_rgba(40,60,80,0.45)] backdrop-blur-xl"
        />
        <Intro />

        <Stage reduced={reduced} />
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="container-x relative z-10 mb-7 w-full">
      <Heading
        title="Featured Compounds"
        className="[&_h2]:!text-accent-dark [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-[clamp(1.75rem,1.1rem+2.2vw,2.6rem)]"
      />
    </div>
  );
}

function Intro() {
  return (
    <div className="container-x relative z-10 w-full">
      <p className="mt-2 max-w-[34rem] text-[0.85rem] leading-[1.55] text-muted text-pretty">
        Every compound is HPLC-verified, independently tested, lot-traceable and
        packaged under stability-grade conditions to support precision peptide
        research.
      </p>
      <Link
        to="/products"
        className="group mt-2 inline-flex items-center gap-2 text-xs tracking-wide text-accent-dark"
      >
        View full catalogue
        <span className="h-px w-6 bg-accent-dark transition-all duration-500 group-hover:w-9" />
      </Link>
    </div>
  );
}

/**
 * One card in the middle, the other products' pens either side. Hovering or
 * tapping a pen swaps its product with the one in the card, so the pen that was
 * on the card takes the hovered pen's place. The card is open while the pointer is anywhere on the
 * stage, so the box and details are what you see as you move between pens.
 */
function Stage({ reduced }: { reduced: boolean }) {
  // Which product sits in each spot: [left pen, card, right pen]. Picking a side
  // pen swaps it with the one in the card, so the spots themselves never move.
  const [slots, setSlots] = useState<[number, number, number]>([2, 0, 1]);
  const [left, active, right] = slots;
  const swap = (side: 0 | 2) =>
    setSlots((cur) => {
      const n = [...cur] as [number, number, number];
      [n[1], n[side]] = [cur[side], cur[1]];
      return n;
    });
  const [engaged, setEngaged] = useState(false);
  const target = useMotionValue(reduced ? 1 : 0);
  const open = useSpring(target, { stiffness: 80, damping: 16, mass: 0.9 });
  useEffect(() => {
    target.set(reduced || engaged ? 1 : 0);
  }, [engaged, reduced, target]);

  return (
    <div
      className="container-x relative z-10 mt-8 grid grid-cols-2 items-center gap-x-4 gap-y-8 md:grid-cols-[1fr_auto_1fr] md:gap-x-6"
      style={
        { "--h": "clamp(240px, min(48vh, 60vw), 460px)" } as React.CSSProperties
      }
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setEngaged(false);
      }}
    >
      <PenPick index={left} side="left" onPick={() => swap(0)} />
      <div
        className="col-span-2 row-start-1 justify-self-center md:col-span-1 md:col-start-2"
        onClick={() => setEngaged((v) => !v)}
      >
        <Device item={ITEMS[active]} index={active} open={open} />
      </div>
      <PenPick index={right} side="right" onPick={() => swap(2)} />
    </div>
  );
}

/** A side pen: hovering or tapping it brings its product into the card. */
function PenPick({
  index,
  side,
  onPick,
}: {
  index: number;
  side: "left" | "right";
  onPick: () => void;
}) {
  const { p, pen } = ITEMS[index];
  return (
    <button
      type="button"
      onMouseEnter={onPick}
      onFocus={onPick}
      onClick={onPick}
      aria-label={`Show ${p.name}`}
      className={`group flex flex-col items-center gap-3 outline-none ${side === "left" ? "md:col-start-1" : "md:col-start-3"}`}
    >
      {/* The tilted pen spans more height than the flat image the layout
          measures, so it sits in a box sized to its tilted extent. */}
      <div
        className="grid w-[min(100%,calc(var(--h)*0.72))] place-items-center"
        style={{ height: "calc(var(--h) * 0.72 * 0.66)" }}
      >
        <motion.img
          key={pen}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          src={pen}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className={`w-full max-w-none drop-shadow-[0_22px_20px_rgba(42,15,18,0.38)] transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105 ${side === "left" ? "-rotate-[32deg]" : "rotate-[32deg]"}`}
        />
      </div>
      <span className="flex items-baseline gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-ink/60 transition-colors group-hover:text-accent-dark">
        <span className="font-display text-sm normal-case tracking-normal text-accent-dark">
          0{index + 1}
        </span>
        {p.name}
      </span>
    </button>
  );
}

/* ─────────────────────────────────── device ─────────────────────────────────── */

const HINGE_L = "rounded-[1.5rem_0.4rem_0.4rem_1.5rem]";
const HINGE_R = "rounded-[0.4rem_1.5rem_1.5rem_0.4rem]";
const FACE = "absolute inset-0 overflow-hidden [backface-visibility:hidden]";
// Each face's outer corners follow the panel's. The cover is mirrored inside its
// panel, so its rounded side is the opposite one.
const FACE_L = "rounded-[1.25rem_0.2rem_0.2rem_1.25rem]";
const FACE_L_BACK = "rounded-[0.2rem_1.25rem_1.25rem_0.2rem]";
const FACE_R = "rounded-[0.2rem_1.25rem_1.25rem_0.2rem]";

function Cover({ index, p, pen }: { index: number; p: Product; pen: string }) {
  return (
    <div className="flex h-full flex-col justify-between bg-card p-4 lg:p-5">
      <div>
        <span className="font-display text-4xl font-light leading-none text-accent-dark lg:text-5xl">
          0{index + 1}
        </span>
        <p className="mt-3 text-[0.55rem] uppercase tracking-[0.22em] text-muted">
          {p.tagline}
        </p>
        <h3 className="mt-1.5 font-display text-lg font-medium leading-[1.15] tracking-[-0.02em] text-ink lg:text-xl">
          {p.name}
        </h3>
      </div>
      {/* The product's own pen, tilted across the card. */}
      <div className="relative grid min-h-0 flex-1 place-items-center">
        <img
          src={pen}
          alt={`${p.name} pen`}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="w-[98%] max-w-none -rotate-[32deg] drop-shadow-[0_20px_18px_rgba(42,15,18,0.4)]"
        />
      </div>
      <span className="self-start rounded-full bg-ink px-3 py-1.5 text-[0.58rem] font-medium uppercase tracking-[0.14em] text-bg">
        Hover to unfold →
      </span>
    </div>
  );
}

interface DeviceProps {
  item: Item;
  index: number;
  /** left half: 0 folded over the right panel → 1 open */
  open: MotionValue<number>;
}

function Device({ item, index, open }: DeviceProps) {
  const { p, box, pen, accent } = item;

  // Keep the visible card centred in its slot: folded onto the right panel it
  // sits a quarter of the group width left of centre.
  const x = useTransform(open, (o) => `${-25 * (1 - o)}%`);
  const rotL = useTransform(open, (o) => 180 * (1 - o));
  // Crease shadow deepens on the inner faces as the device closes.
  const crease = useTransform(open, (o) => 0.35 + 0.65 * o);
  // The lifted panel's shadow is a drop-shadow on the whole device, not a
  // box-shadow on the panels: a box-shadow is skewed by the 3D swing.
  const filter = useTransform(
    open,
    (o) =>
      `drop-shadow(0 ${16 + 10 * o}px ${18 + 8 * o}px rgba(42,15,18,0.22))`,
  );

  return (
    <motion.div className="[perspective:1800px]" style={{ filter }}>
      <motion.div
        className="relative flex [transform-style:preserve-3d]"
        style={{ x }}
      >
        {/* ── Left panel: hinged at its right edge ── */}
        <motion.div
          className={`relative z-[2] h-[var(--h)] w-[calc(var(--h)*0.75)] border ${BORDER} bg-card ${HINGE_L}`}
          style={{
            rotateY: rotL,
            transformStyle: "preserve-3d",
            // The right panel overlaps this one by the border width, so the hinge sits half of it inside.
            transformOrigin: `calc(100% - ${BW / 2}px) 50%`,
          }}
        >
          {/* Front — the open page (product visual) */}
          <div className={`${FACE} ${FACE_L} bg-card`}>
            <img
              src={box}
              {...responsive(box, "(min-width: 768px) 320px, 60vw")}
              alt={`${p.name} — Alluvi research device box`}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute inset-x-2 top-1/2 w-[calc(100%-1rem)] -translate-y-1/2 object-contain drop-shadow-[0_22px_22px_rgba(42,15,18,0.38)]"
            />
            <motion.span
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-ink/20 to-transparent"
              style={{ opacity: crease }}
            />
          </div>

          {/* Back — the closed cover, on the right while folded */}
          <div className={`${FACE} [transform:rotateY(180deg)] ${FACE_L_BACK}`}>
            <Cover index={index} p={p} pen={pen} />
          </div>
        </motion.div>

        {/* ── Right panel: fixed, the details page ── */}
        <div
          className={`relative h-[var(--h)] w-[calc(var(--h)*0.75)] border ${BORDER} bg-card ${HINGE_R}`}
          style={{ marginLeft: -BW }}
        >
          <div
            className={`${FACE} ${FACE_R} flex flex-col justify-between bg-card p-4 lg:p-5`}
          >
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-ink/15 to-transparent"
              style={{ opacity: crease }}
            />
            <div className="relative">
              <p className="text-[0.55rem] uppercase tracking-[0.22em] text-muted">
                {p.tagline}
              </p>
              <h3 className="mt-1.5 font-display text-base font-medium leading-[1.15] tracking-[-0.02em] text-ink lg:text-lg">
                {p.name}
              </h3>
              <p className="mt-2 line-clamp-5 text-[0.72rem] leading-[1.5] text-muted">
                {p.desc}
              </p>
            </div>

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1 text-[0.58rem] font-medium text-accent-dark">
                <span
                  className="grid h-3 w-3 place-items-center rounded-full text-bg"
                  style={{ background: accent }}
                >
                  <svg width="7" height="7" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7.5L5.5 11L12 3.5"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {p.stat}
              </span>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="font-display text-sm text-ink">
                  {formatPrice(p.price, p.currency)}
                </span>
                <Link
                  to={`/products/${p.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="group/cta inline-flex items-center gap-1.5 text-[0.7rem] font-medium text-ink transition-colors hover:text-accent-dark"
                >
                  Explore In Details
                  <span className="transition-transform duration-500 group-hover/cta:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
