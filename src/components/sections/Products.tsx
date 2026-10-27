import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useReducedMotion } from "../../lib/useReducedMotion";
import { PRODUCTS } from "../../lib/content";
import { formatPrice } from "../../lib/format";
import { responsive } from "../../lib/responsiveImage";

/**
 * Featured Compounds — an editorial zig-zag. Each product is one row: a
 * pastel, leaf-shaped photo panel on one side and a short editorial block on
 * the other (italic accent word, bold condensed heading, light sub-line, copy,
 * and a small all-caps call to action). Rows alternate sides, and the panels
 * are tinted in the three pastels of the reference layout: peach, blush and
 * lilac. Each panel's rounded corners sit on opposite diagonals so the
 * silhouettes read as leaves rather than cards.
 */
const FEATURED = [
  {
    id: "glow",
    img: "/images/ecom/feature-glow.webp",
    tint: "#fde3cf",
    accent: "Radiance",
    headline: "Nothing can stop",
    cta: "Explore product",
  },
  {
    // MOTS-c is not in the catalogue yet, so the row carries its own copy and
    // shows "Coming soon" instead of a price and link.
    id: "mots-c",
    img: "/images/ecom/feature-mots-c.webp",
    tint: "#f9d2d6",
    accent: "Energy",
    headline: "Fuel the cell, go further",
    cta: "Coming soon",
    name: "MOTS-c 40mg",
    tagline: "Mitochondrial Peptide · Reference Standard",
    desc: "A mitochondrial-derived research peptide supplied as a laboratory reference material for in-vitro metabolic and cellular-signalling study.",
    stat: "HPLC-verified",
  },
  {
    // Tesamorelin is not in the catalogue yet either, so it carries its own
    // copy and shows "Coming soon".
    id: "tesamorelin",
    img: "/images/ecom/feature-tesamorelin.webp",
    tint: "#e4d6f7",
    accent: "Definition",
    headline: "Sculpt lean, stay strong",
    cta: "Coming soon",
    name: "Tesamorelin 20mg",
    tagline: "GHRH Analogue · Reference Standard",
    desc: "A growth-hormone-releasing-hormone analogue supplied as a laboratory reference material for in-vitro study of targeted fat reduction, body definition and lean-mass preservation.",
    stat: "HPLC-verified",
  },
] as const;

type Product = (typeof PRODUCTS)[number];
interface Item {
  id: string;
  img: string;
  tint: string;
  accent: string;
  headline: string;
  cta: string;
  name: string;
  tagline: string;
  desc: string;
  stat: string;
  /** Catalogue product, when there is one; the row then links to its page. */
  p?: Product;
}
const ITEMS: Item[] = FEATURED.map((f) => {
  if ("name" in f) return f;
  const p = PRODUCTS.find((x) => x.id === f.id)!;
  return { ...f, name: p.name, tagline: p.tagline, desc: p.desc, stat: p.stat, p };
});

export default function Products() {
  return (
    <section
      id="products"
      aria-label="Featured compounds"
      className="relative overflow-hidden bg-white pb-12 pt-12 md:pb-18 md:pt-16"
    >
      <Header />

      <div className="container-x relative z-10 mt-10 flex w-full flex-col gap-12 md:mt-12 md:gap-4 lg:gap-6">
        {ITEMS.map((it, i) => (
          <Row key={it.id} item={it} index={i} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

/** Small top line: section title on the left, catalogue link on the right. */
function Header() {
  return (
    <div className="container-x relative z-10 flex w-full items-end justify-between gap-6">
      <h2 className="flex flex-col">
        <span className="font-display text-[0.72rem] uppercase tracking-[0.32em] text-ink/60">Featured</span>
        <span className="mt-1 font-display text-[clamp(2rem,1.4rem+2.2vw,3.1rem)] font-bold leading-[0.95] tracking-[-0.02em] text-ink/80">
          <span aria-hidden className="mr-1 font-normal">#</span>
          Compounds
        </span>
      </h2>
      <Link
        to="/products"
        className="group inline-flex shrink-0 items-center gap-2 font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink/70 transition-colors hover:text-accent-dark"
      >
        Full catalogue
        <span className="h-px w-6 bg-current transition-all duration-500 group-hover:w-9" />
      </Link>
    </div>
  );
}

/** In-view reveal: fades up once, with a small delay for the second column. */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * One product row. `flip` puts the photo on the left and the text on the
 * right; the default is text left, photo right. On mobile the photo always
 * comes first.
 */
function Row({ item, index, flip }: { item: Item; index: number; flip: boolean }) {
  return (
    <article className="mx-auto grid w-full max-w-[1000px] items-center gap-6 md:grid-cols-2 md:gap-20 lg:gap-40">
      <Reveal className={`order-1 ${flip ? "md:order-1" : "md:order-2"}`}>
        <Panel item={item} index={index} flip={flip} />
      </Reveal>
      <Reveal delay={0.15} className={`order-2 ${flip ? "md:order-2" : "md:order-1 md:justify-self-end"}`}>
        <Copy item={item} />
      </Reveal>
    </article>
  );
}

/**
 * The pastel leaf. Two opposite corners are fully rounded and the other two
 * are square, alternating per row so the shapes tumble down the page. The
 * photo is clipped by the same shape and zooms gently on hover.
 */
function Panel({ item, index, flip }: { item: Item; index: number; flip: boolean }) {
  const { p, img, tint, name } = item;
  const leaf = flip
    ? "rounded-tl-[46%] rounded-br-[46%] rounded-tr-[1.5rem] rounded-bl-[1.5rem]"
    : "rounded-tr-[46%] rounded-bl-[46%] rounded-tl-[1.5rem] rounded-br-[1.5rem]";
  const cls = `group relative block aspect-[4/5] w-full max-w-[420px] overflow-hidden ${leaf} outline-none ring-accent-dark/50 focus-visible:ring-2 ${flip ? "" : "md:ml-auto"}`;

  const inner = (
    <>
      <div className="absolute inset-0" style={{ background: tint }} />
      <img
        src={img}
        {...responsive(img, "(min-width: 768px) 40vw, 100vw")}
        alt={`${name} held up to the camera`}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-[50%_20%] transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-[1.05] group-focus-visible:scale-[1.05]"
      />
      <span className="pointer-events-none absolute bottom-5 left-6 font-display text-sm font-light tracking-[0.2em] text-ink/50 md:bottom-7 md:left-8">
        0{index + 1}
      </span>
    </>
  );

  return p ? (
    <Link to={`/products/${p.slug}`} aria-label={`${name} — view product`} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** The editorial block beside each panel. */
function Copy({ item }: { item: Item }) {
  const { p, accent, headline, cta, name, tagline, desc, stat } = item;
  const price = p ? formatPrice(p.price, p.currency) : null;

  return (
    <div className="max-w-[22rem]">
      {/* Italic accent word, set to overlap the top of the heading like a
          handwritten note. */}
      <span className="relative z-10 -mb-1.5 block translate-x-1 font-display text-[clamp(1.5rem,1.1rem+1.2vw,2.1rem)] font-normal italic leading-none text-accent md:-mb-2">
        {accent}
      </span>
      <h3 className="font-jost text-[clamp(1.5rem,1rem+1.7vw,2.3rem)] font-bold uppercase leading-[0.95] tracking-[-0.01em] text-ink">
        {headline}
        <span className="mt-1 block font-light normal-case tracking-[0.02em] text-ink/40">{name}</span>
      </h3>

      <p className="mt-5 font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ink/55">
        {tagline.replace(/\s*·\s*/g, " ")}
      </p>
      <p className="mt-2.5 font-sans text-[0.74rem] leading-[1.65] text-muted text-pretty">{desc}</p>
      <p className="mt-2.5 font-sans text-[0.66rem] leading-[1.55] text-ink/60">
        {stat}. Lot-traceable and packaged under stability-grade conditions.
      </p>

      <div className="mt-5 flex items-center gap-5">
        {p ? (
          <Link
            to={`/products/${p.slug}`}
            className="group inline-flex items-center gap-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-ink transition-colors hover:text-accent-dark"
          >
            <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden="true" className="fill-current transition-transform duration-500 group-hover:translate-x-1">
              <path d="M0 0l9 5-9 5z" />
            </svg>
            {cta}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-3 font-sans text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-ink/50">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {cta}
          </span>
        )}
        {price && <span className="font-display text-sm text-ink/70">{price}</span>}
      </div>
    </div>
  );
}
