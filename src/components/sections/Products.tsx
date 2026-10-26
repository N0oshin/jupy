import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Heading from "../ui/Heading";
import { useReducedMotion } from "../../lib/useReducedMotion";
import { PRODUCTS } from "../../lib/content";
import { formatPrice } from "../../lib/format";
import { responsive } from "../../lib/responsiveImage";

/**
 * Featured Compounds — three portrait photos side by side, one per product.
 * Each is a full-bleed card: at rest it is just the photo. Hovering (or
 * focusing, or tapping on touch) blurs and darkens the photo and brings the
 * product's details up over it. The whole card links to the product page.
 */
const FEATURED = [
  { id: "glow", img: "/images/ecom/feature-glow.webp", accent: "#e0409a" },
  {
    // MOTS-c is not in the catalogue yet, so the card carries its own copy and
    // shows "Coming soon" instead of a price and link.
    id: "mots-c",
    img: "/images/ecom/feature-mots-c.webp",
    accent: "#9a3bb5",
    name: "MOTS-c 40mg",
    tagline: "Mitochondrial Peptide · Reference Standard",
    desc: "A mitochondrial-derived research peptide supplied as a laboratory reference material for in-vitro metabolic and cellular-signalling study.",
    stat: "HPLC-verified",
  },
  { id: "tirzepatide", img: "/images/ecom/feature-tesamorelin.webp", accent: "#f26b21" },
] as const;

type Product = (typeof PRODUCTS)[number];
interface Item {
  id: string;
  img: string;
  accent: string;
  name: string;
  tagline: string;
  desc: string;
  stat: string;
  /** Catalogue product, when there is one; the card then links to its page. */
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
      className="relative flex flex-col overflow-hidden bg-bg pb-12 pt-12 md:pt-14"
    >
      <Header />
      <Intro />

      {/* Cards are capped well under the container width and centred. Each one
          slides in from the left, one after the other. */}
      <div className="container-x relative z-10 mt-12 mb-10 w-full">
        <div className="mx-auto grid max-w-[1040px] gap-4 sm:grid-cols-3 md:gap-7">
          {ITEMS.map((it, i) => (
            <SlideIn key={it.id} delay={i * 0.22}>
              <Card item={it} index={i} />
            </SlideIn>
          ))}
        </div>
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
    <div className="container-x relative z-10 flex w-full flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
      <p className="mt-2 max-w-[40rem] text-[0.85rem] leading-[1.55] text-muted text-pretty">
        Every compound is HPLC-verified, independently tested, lot-traceable and
        packaged under stability-grade conditions to support precision peptide
        research.
      </p>
      <Link
        to="/products"
        className="group inline-flex shrink-0 items-center gap-2 text-xs tracking-wide text-accent-dark"
      >
        View full catalogue
        <span className="h-px w-6 bg-accent-dark transition-all duration-500 group-hover:w-9" />
      </Link>
    </div>
  );
}

/** In-view reveal that slides the card in from the left, once. */
function SlideIn({ children, delay }: { children: React.ReactNode; delay: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, x: -80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.35, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * One portrait card. Tailwind's `group` drives everything from hover and
 * keyboard focus; on touch, where there is no hover, the first tap focuses the
 * link and shows the details, the second follows it.
 */
function Card({ item, index }: { item: Item; index: number }) {
  const { p, img, accent, name, tagline, desc, stat } = item;
  const price = p ? formatPrice(p.price, p.currency) : null;
  const cls =
    "group relative block aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-[#c9b8a8] shadow-[0_30px_60px_-30px_rgba(40,60,80,0.55)] outline-none ring-accent-dark/50 focus-visible:ring-2";
  const label = `${name} — ${tagline}. ${price ?? "Coming soon"}${p ? ". Explore in details" : ""}`;

  const inner = (
    <>
      {/* The photo. Blurs, lightens and eases in a touch on hover so the
          details sit on a calm surface. Scaled slightly so the blur has no
          soft edge. */}
      <img
        src={img}
        {...responsive(img, "(min-width: 640px) 33vw, 100vw")}
        alt={`${name} held up to the camera`}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-[50%_20%] transition-[filter,transform] duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.06] group-hover:blur-[10px] group-hover:brightness-[1.12] group-focus-visible:scale-[1.06] group-focus-visible:blur-[10px] group-focus-visible:brightness-[1.12]"
      />

      {/* Resting label: the number and name, bottom-left, over a light scrim.
          Fades out as the details come up. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-5 pt-16 text-white transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0 lg:p-6">
        <span className="font-display text-3xl font-light leading-none">0{index + 1}</span>
        <h3 className="mt-2 font-display text-lg font-medium leading-[1.15] tracking-[-0.02em] lg:text-xl">{name}</h3>
      </div>

      {/* White scrim that fades in with the blur so the details sit on a
          bright, frosted surface. */}
      <div className="pointer-events-none absolute inset-0 bg-white/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />

      {/* Details, revealed over the blurred photo. */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 text-accent-dark opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 lg:p-6">
        <div className="translate-y-4 transition-transform duration-700 ease-[var(--ease-lux)] group-hover:translate-y-0 group-focus-visible:translate-y-0">
          <span className="font-display text-4xl font-light leading-none">0{index + 1}</span>
          <p className="mt-4 text-[0.6rem] uppercase tracking-[0.22em] text-accent-dark/70">{tagline}</p>
          <h3 className="mt-1.5 font-display text-xl font-medium leading-[1.15] tracking-[-0.02em] lg:text-2xl">{name}</h3>
          <p className="mt-3 line-clamp-3 text-[0.8rem] leading-[1.5] text-accent-dark/80">{desc}</p>

          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent-dark/10 px-3 py-1 text-[0.62rem] font-medium backdrop-blur-sm">
            <span className="grid h-3.5 w-3.5 place-items-center rounded-full text-white" style={{ background: accent }}>
              <svg width="8" height="8" viewBox="0 0 14 14" fill="none">
                <path d="M2 7.5L5.5 11L12 3.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {stat}
          </span>

          <div className="mt-4 flex items-center justify-between border-t border-accent-dark/20 pt-4">
            {price ? (
              <>
                <span className="font-display text-lg">{price}</span>
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  Explore In Details
                  <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                </span>
              </>
            ) : (
              <span className="inline-flex items-center rounded-full border border-accent-dark/40 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.14em]">
                Coming soon
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // With a product page the whole card is a link; without one it is a
  // focusable panel so keyboard and touch users can still open the details.
  return p ? (
    <Link to={`/products/${p.slug}`} aria-label={label} className={cls}>
      {inner}
    </Link>
  ) : (
    <div tabIndex={0} aria-label={label} className={cls}>
      {inner}
    </div>
  );
}
