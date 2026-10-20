import { useState } from 'react'
import { responsive } from '../../lib/responsiveImage'

interface Props {
  src: string
  alt: string
  className?: string
  /** brand gradient shown while loading / on error */
  fallback?: string
  /** Layout width of the image, for picking the right srcset candidate. */
  sizes?: string
  /** Above-the-fold: load eagerly at high priority instead of lazily. */
  eager?: boolean
  /** Intrinsic ratio (e.g. "16/9") to reserve space and avoid layout shift. */
  aspectRatio?: string
  /** CSS object-position, to keep the subject in frame when object-cover crops. */
  objectPosition?: string
}

/**
 * Image with blur-up load-in and a graceful on-brand gradient fallback so the
 * UI never shows a broken asset.
 *
 * Emits a srcset from the generated manifest, so a phone downloads the 640px
 * file rather than the 2048px one. Lazy + async unless `eager` is set, which
 * also raises fetch priority — reserve that for genuinely above-the-fold art.
 */
export default function Img({
  src,
  alt,
  className = '',
  fallback = 'linear-gradient(135deg,#f5efe1,#e5d3af)',
  sizes = '100vw',
  eager = false,
  aspectRatio,
  objectPosition,
}: Props) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={{ background: fallback, aspectRatio }}
    >
      {!failed && (
        <img
          src={src}
          {...responsive(src, sizes)}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={objectPosition ? { objectPosition } : undefined}
          className={`h-full w-full object-cover transition-[opacity,transform,filter] duration-[1200ms] ease-out ${
            loaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-105'
          }`}
        />
      )}
      {failed && (
        <span className="absolute inset-0 grid place-items-center text-accent-dark/40">
          <span className="inline-flex items-center gap-2 font-display">
            <span className="text-2xl font-semibold lowercase tracking-[-0.015em]" style={{ fontFeatureSettings: '"ss01", "cv01"' }}>
              <span className="italic text-accent-dark">j</span>upyter
            </span>
            <span className="h-5 w-px bg-accent-dark/40" />
            <span className="text-[0.65rem] uppercase tracking-[0.32em]">Labs</span>
          </span>
        </span>
      )}
    </span>
  )
}
