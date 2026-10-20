/**
 * Converts the Alluvi box renders in public/images/ecom/boxes into trimmed,
 * web-sized WebP files with the same responsive variants (<name>-640.webp,
 * <name>-1024.webp) that <Img> and imageManifest.ts already understand. Output
 * goes to public/images/products/boxes, named by product slug so content.ts
 * never references the designer's free-text filenames (spaces, "+", case).
 *
 * The source PNGs carry a large transparent margin above and below the box, and
 * a few (Glow, BPC-157) also have stray opaque blocks outside it, so a plain
 * alpha-bounds trim is not enough. The box is located instead by its dense
 * rows, then dense columns within those rows; sparse strays fall below both
 * thresholds and are cropped away.
 *
 *   node scripts/convert-product-boxes.mjs && npm run images:manifest
 */
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'public', 'images', 'ecom', 'boxes')
const OUT = join(ROOT, 'public', 'images', 'products', 'boxes')

// designer filename → output slug. "Precision-cut carton … -10" is a second
// CJC-1295 render and is intentionally unused.
const BOXES = {
  'Bpc.png': 'bpc-157',
  'Glow-.png': 'glow',
  'Precision carton cutout with soft shadow-12.png': 'mots-c',
  'Alluvi NAD+ box with two yellow pens-5.png': 'nad-plus',
  'Alluvi Retatrutide box with turquoise pen-4.png': 'retatrutide-20',
  'Alluvi retatrutide box with turquoise pen-7.png': 'retatrutide-40',
  'Transparent carton with clean edges-17.png': 'tesamorelin',
  'Alluvi Tirzepatide box with orange pen-6.png': 'tirzepatide',
  'ALLUVI CJC-1295 box with pink pen-1.png': 'cjc-1295',
}

const VARIANTS = [640, 1024]
const OPAQUE = 200 // alpha above this counts as box pixel
const PAD = 24

/** First and last index whose count is at least `min`. */
function span(counts, min) {
  const first = counts.findIndex((c) => c >= min)
  const last = counts.length - 1 - [...counts].reverse().findIndex((c) => c >= min)
  return [first, last]
}

async function boxBounds(file) {
  const { data, info } = await sharp(file).ensureAlpha().extractChannel('alpha').raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info

  const rows = new Array(h).fill(0)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[y * w + x] > OPAQUE) rows[y]++
  const [top, bottom] = span(rows, w * 0.4)

  const cols = new Array(w).fill(0)
  for (let y = top; y <= bottom; y++) for (let x = 0; x < w; x++) if (data[y * w + x] > OPAQUE) cols[x]++
  const [left, right] = span(cols, (bottom - top + 1) * 0.5)

  return { left, top, width: right - left + 1, height: bottom - top + 1 }
}

mkdirSync(OUT, { recursive: true })

for (const [file, slug] of Object.entries(BOXES)) {
  const src = join(SRC, file)
  const region = await boxBounds(src)
  const padded = await sharp(src)
    .extract(region)
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  await sharp(padded).webp({ quality: 86, alphaQuality: 90 }).toFile(join(OUT, `${slug}.webp`))
  for (const w of VARIANTS) {
    await sharp(padded)
      .resize({ width: w, withoutEnlargement: true })
      // The box's small print is the first casualty of downscaling; a light
      // unsharp pass after the resize keeps it legible at carousel size.
      .sharpen({ sigma: 0.6 })
      .webp({ quality: 84, alphaQuality: 90 })
      .toFile(join(OUT, `${slug}-${w}.webp`))
  }
  console.log(`${slug.padEnd(16)} ${region.width}×${region.height}  @ ${region.left},${region.top}`)
}
