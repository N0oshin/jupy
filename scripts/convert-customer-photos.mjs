/**
 * Converts the customer portraits in public/images/ecom/customers (source
 * JPGs, mixed sizes) into portrait 3:4 WebP cards for the Customer Stories
 * carousel, in public/images/customers, named by the reviewer:
 *
 *   <slug>.webp        900 × 1200 — the featured photo card
 *   <slug>-640.webp    640 × 853  — srcset variant for the small side cards
 *
 * Run `npm run images:manifest` afterwards so responsive() picks up the variant.
 *
 *   node scripts/convert-customer-photos.mjs
 */
import { mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'public', 'images', 'ecom', 'customers')
const OUT = join(ROOT, 'public', 'images', 'customers')

// The two Gemini shots are the same person; only the first one is used.
const PHOTOS = {
  mei: '2ee5d558892c3595675ccb7738c40002.jpg',
  charlotte: '368c9cacdf41d3c8920c1ee30b4d4555.jpg',
  elena: '43870721cdc73735cd31f42413c466ed.jpg',
  hannah: '6a0f9003a41b90ac5186b9d2aaa96228.jpg',
  isabel: '7aea08c5323513c0a4c28ff5cb4d5d14.jpg',
  yasmin: 'fa8010009833c804e3cf638d0ddf848e.jpg',
  tomas: 'Gemini_Generated_Image_di28kjdi28kjdi28.jpg',
}

const WIDTH = 900
const VARIANTS = [640]
const ratio = (w) => Math.round((w * 4) / 3)

mkdirSync(OUT, { recursive: true })

for (const [slug, file] of Object.entries(PHOTOS)) {
  const src = join(SRC, file)
  const meta = await sharp(src).metadata()
  // Never upscale: crop to 3:4 at the largest width the source allows.
  const w = Math.min(WIDTH, meta.width, Math.floor((meta.height * 3) / 4))
  const base = sharp(src).resize({ width: w, height: ratio(w), fit: 'cover', position: sharp.strategy.attention })
  await base.clone().webp({ quality: 84 }).toFile(join(OUT, `${slug}.webp`))
  for (const v of VARIANTS) {
    await base.clone().resize({ width: v, height: ratio(v), fit: 'cover' }).webp({ quality: 82 }).toFile(join(OUT, `${slug}-${v}.webp`))
  }
  const m = await sharp(join(OUT, `${slug}.webp`)).metadata()
  console.log(`${slug.padEnd(12)} ${m.width}×${m.height} (${Math.round(statSync(join(OUT, `${slug}.webp`)).size / 1024)} KB)`)
}
