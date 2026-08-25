/**
 * Generates public/sitemap.xml and public/robots.txt.
 *
 * Both files have to carry absolute URLs, so both have to know the production
 * origin — and until now that origin was hand-copied into them, into index.html
 * and into useSeo.ts, with nothing keeping the four in step. This script makes
 * VITE_SITE_URL the single source of truth: it runs as part of `npm run build`
 * (and can be run on its own with `npm run seo:files`), so a domain change is a
 * one-line edit in .env.
 *
 * Product URLs are derived from src/lib/content.ts rather than listed here, so
 * adding a product to the catalogue puts it in the sitemap automatically.
 *
 * Read directly with a regex instead of imported: this is a plain .mjs script
 * and content.ts is TypeScript, so importing it would mean pulling a compiler
 * into the build for one array of strings.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Origin, no trailing slash. Mirrors the fallback in src/lib/useSeo.ts. */
const SITE_URL = (process.env.VITE_SITE_URL || readEnvFile('VITE_SITE_URL') || 'https://jupyterlabs.net').replace(
  /\/$/,
  '',
)

/** Minimal .env reader — the script runs before Vite, so loadEnv isn't available. */
function readEnvFile(key) {
  try {
    const raw = readFileSync(resolve(root, '.env'), 'utf8')
    const match = raw.match(new RegExp(`^${key}=(.*)$`, 'm'))
    return match ? match[1].trim() : null
  } catch {
    return null
  }
}

// ── Product slugs from the catalogue ──
const content = readFileSync(resolve(root, 'src/lib/content.ts'), 'utf8')
const slugs = [...content.matchAll(/^\s*slug:\s*'([^']+)'/gm)].map((m) => m[1])

if (slugs.length === 0) {
  // A silent empty result would ship a sitemap missing every product page, and
  // nothing downstream would notice. Better to break the build.
  console.error('[gen-seo-files] No product slugs found in src/lib/content.ts — refusing to write a partial sitemap.')
  process.exit(1)
}

/**
 * Public, indexable routes.
 *
 * Deliberately excluded (see DISALLOW below): cart, checkout, order tracking,
 * account/auth and payment-capture pages. They are per-user or transactional,
 * they already send `noindex` via useSeo, and listing them here would ask
 * Google to crawl pages it must not index.
 */
const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'weekly', priority: '0.9' },
  { path: '/about-us', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'yearly', priority: '0.7' },
  { path: '/press-release', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-of-service', changefreq: 'yearly', priority: '0.3' },
  { path: '/refund-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/shipping-policy', changefreq: 'yearly', priority: '0.3' },
]

const routes = [
  ...STATIC_ROUTES,
  ...slugs.map((slug) => ({ path: `/products/${slug}`, changefreq: 'monthly', priority: '0.8' })),
]

// Canonical form: no trailing slash anywhere except the root. Emitting both
// /shop and /shop/ is the classic way to split one page's ranking signals in
// two, so only one form is ever published.
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

/**
 * Private areas. These are `Disallow`, not `noindex`-only, because there is no
 * value in crawl budget being spent on them. Nothing here blocks a public page:
 * the catalogue, product pages, contact and policies are all still allowed.
 */
const DISALLOW = [
  '/cart',
  '/checkout',
  '/orders',
  '/track',
  '/signin',
  '/register',
  '/forgot-password',
  '/payment-capture/',
]

const robots = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Private / transactional routes — per-user or checkout pages, never indexable.
${DISALLOW.map((p) => `Disallow: ${p}`).join('\n')}

Sitemap: ${SITE_URL}/sitemap.xml
`

writeFileSync(resolve(root, 'public/sitemap.xml'), xml)
writeFileSync(resolve(root, 'public/robots.txt'), robots)

console.log(`[gen-seo-files] wrote public/sitemap.xml (${routes.length} URLs) and public/robots.txt for ${SITE_URL}`)
