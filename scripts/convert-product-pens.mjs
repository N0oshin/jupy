/**
 * Converts the isolated pen renders in public/images/ecom/pen into trimmed,
 * web-sized WebP files for the closed covers of the Featured Compounds
 * showcase, in public/images/products/pens, named by product slug. The pens stay
 * horizontal here; the cover tilts them with CSS.
 *
 * The renders are 2172×724 horizontal pens with a few stray specks beside the
 * clip, so the pen is located by its dense rows/columns (as in
 * convert-product-boxes.mjs) rather than by plain alpha bounds, then scaled to a
 * width that is generous for the ~300px it is drawn at, even at 3× density.
 *
 *   node scripts/convert-product-pens.mjs
 */
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'public', 'images', 'ecom', 'pen')
const OUT = join(ROOT, 'public', 'images', 'products', 'pens')

// designer filename → product slug. Retatrutide 20mg ships as 4 × 5mg and 40mg as
// 4 × 10mg, so each takes the pen carrying its per-pen dose.
const PENS = {
  'Alluvi Glow pen, perfectly isolated-7.png': 'glow',
  'ALLUVI Tirzepatide Pen Cutout-5.png': 'tirzepatide',
  'Retouched Alluvi BPC-157&TB-500 injection pen-8.png': 'bpc-157',
  'ALLUVI retatrutide pen, isolated-3.png': 'retatrutide-20',
  'ALLUVI Retatrutide 10 mg pen.png': 'retatrutide-40',
}

const OPAQUE = 200
const PAD = 12
const WIDTH = 900

function span(counts, min) {
  const first = counts.findIndex((c) => c >= min)
  const last = counts.length - 1 - [...counts].reverse().findIndex((c) => c >= min)
  return [first, last]
}

async function penBounds(file) {
  const { data, info } = await sharp(file).ensureAlpha().extractChannel('alpha').raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const rows = new Array(h).fill(0)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[y * w + x] > OPAQUE) rows[y]++
  const [top, bottom] = span(rows, w * 0.12)
  const cols = new Array(w).fill(0)
  for (let y = top; y <= bottom; y++) for (let x = 0; x < w; x++) if (data[y * w + x] > OPAQUE) cols[x]++
  const [left, right] = span(cols, (bottom - top + 1) * 0.25)
  return { left, top, width: right - left + 1, height: bottom - top + 1 }
}

mkdirSync(OUT, { recursive: true })

for (const [file, slug] of Object.entries(PENS)) {
  const src = join(SRC, file)
  const region = await penBounds(src)
  const out = join(OUT, `${slug}.webp`)
  await sharp(src)
    .extract(region)
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: WIDTH, withoutEnlargement: true })
    .sharpen({ sigma: 0.5 })
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile(out)
  const m = await sharp(out).metadata()
  console.log(`${slug.padEnd(16)} ${region.width}×${region.height} → ${m.width}×${m.height}`)
}
