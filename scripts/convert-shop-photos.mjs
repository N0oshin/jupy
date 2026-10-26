/**
 * Converts the lifestyle product photos in public/images/ecom/shop (one folder
 * per compound, a "pen on stone" shot and a "carton and pen" shot each) into
 * square, web-sized WebP files for the Shop grid and the product-detail
 * gallery, in public/images/products/shop, named by product id:
 *
 *   <id>-pen.webp     hero shot used on the product card and as gallery slot 1
 *   <id>-carton.webp  carton + pen shot used as gallery slot 2
 *
 * Each also gets -640 and -1024 variants so <Img>/responsive() can emit a
 * srcset. Run `npm run images:manifest` afterwards.
 *
 *   node scripts/convert-shop-photos.mjs
 */
import { mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'public', 'images', 'ecom', 'shop')
const OUT = join(ROOT, 'public', 'images', 'products', 'shop')

// Retatrutide 20mg ships as 4 × 5mg pens and 40mg as 4 × 10mg, so each takes the
// photo set carrying its per-pen dose (same convention as convert-product-pens).
const SHOTS = {
  'bpc-157': { dir: 'bpc', pen: 'Green-accent pen on warm travertine-6.png', carton: 'BPC-157 & TB-500 pen set-5.png' },
  'cjc-1295': { dir: 'cjc', pen: 'Coral-accent pen on beige tabletop-5.png', carton: 'CJC-1295 carton and pen-15.png' },
  glow: { dir: 'glow', pen: 'Blue-accent ALLUVI GLOW pen on limestone-7.png', carton: 'Glow GHK-CU on travertine-8.png' },
  'mots-c': { dir: 'motc', pen: 'Purple MOTS-C Pen on Sandstone-8.png', carton: 'MOTS-C pen and carton on travertine-6.png' },
  'nad-plus': { dir: 'nad', pen: 'ALLUVI NAD+ pen on limestone-4.png', carton: 'Holographic NAD+ carton and yellow pen-7.png' },
  'retatrutide-20': { dir: 'reta5', pen: 'ALLUVI Retatrutide pen on limestone-1.png', carton: 'Retatrutide pen and carton on travertine-9.png' },
  'retatrutide-40': { dir: 'reta10', pen: 'Turquoise Retatrutide Pen on Limestone-9.png', carton: 'Retatrutide 10 mg carton and pen-3.png' },
  tesamorelin: { dir: 'tesa', pen: 'Alluvi Tesamorelin Pen on Travertine-2.png', carton: 'Tesamorelin carton and red pen-12.png' },
  tirzepatide: { dir: 'trizi', pen: 'Orange-accent Alluvi pen on warm beige-3.png', carton: 'Tirzepatide Carton and Pen-1.png' },
}

const SIZE = 1254
const VARIANTS = [640, 1024]

mkdirSync(OUT, { recursive: true })

async function convert(src, name) {
  // Square crop at the largest size the source allows, never upscaled.
  const meta = await sharp(src).metadata()
  const side = Math.min(SIZE, meta.width, meta.height)
  const base = sharp(src).resize({ width: side, height: side, fit: 'cover', position: 'centre' })
  await base.clone().webp({ quality: 84 }).toFile(join(OUT, `${name}.webp`))
  for (const w of VARIANTS) {
    await base.clone().resize({ width: w, height: w, fit: 'cover' }).webp({ quality: 82 }).toFile(join(OUT, `${name}-${w}.webp`))
  }
  const m = await sharp(join(OUT, `${name}.webp`)).metadata()
  console.log(`${name.padEnd(24)} ${m.width}×${m.height} (${Math.round(statSync(join(OUT, `${name}.webp`)).size / 1024)} KB)`)
}

for (const [id, s] of Object.entries(SHOTS)) {
  await convert(join(SRC, s.dir, s.pen), `${id}-pen`)
  await convert(join(SRC, s.dir, s.carton), `${id}-carton`)
}
