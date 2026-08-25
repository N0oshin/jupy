import { ACTIVE_SOCIAL_LINKS, type SocialLink } from '../../lib/social'

/**
 * Circular social profile icons.
 *
 * Renders nothing at all when no profile is configured in lib/social.ts, so the
 * footer never shows an empty row or a link that goes nowhere.
 *
 * Glyphs are inline SVG rather than an icon package — the project has no icon
 * dependency and the existing Navbar/Footer already inline their SVGs, so this
 * matches the codebase and adds no bundle weight.
 */

const GLYPHS: Record<SocialLink['id'], React.ReactNode> = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: (
    <path
      d="M14.2 3v9.9a3.1 3.1 0 1 1-2.6-3.05"
      // The note-and-hook silhouette, drawn as one stroke plus the flag below.
    />
  ),
  youtube: (
    <>
      <rect x="2" y="5.4" width="20" height="13.2" rx="4" />
      <path d="M10.2 9.3 15 12l-4.8 2.7Z" fill="currentColor" stroke="none" />
    </>
  ),
  x: (
    <path
      d="M3.2 3.2h3.9l4.5 6.1 5.2-6.1h2.4l-6.5 7.6 6.9 9.5h-3.9l-4.8-6.6-5.6 6.6H2.9l7-8.2Z"
      fill="currentColor"
      stroke="none"
    />
  ),
}

// TikTok needs a second path (the flag off the stem); keeping it separate keeps
// the shared stroke settings above readable.
const TIKTOK_FLAG = <path d="M14.2 3c.3 2.2 1.9 3.8 4.1 4v2.5c-1.6 0-3-.5-4.1-1.4" />

interface Props {
  /** Tone of the surrounding surface, so the ring/hover reads correctly. */
  tone?: 'light' | 'dark'
  className?: string
  /** Accessible name for the list itself. */
  label?: string
}

export default function SocialLinks({ tone = 'light', className = '', label = 'Jupyter Labs on social media' }: Props) {
  if (ACTIVE_SOCIAL_LINKS.length === 0) return null

  const ring =
    tone === 'dark'
      ? 'border-bg/30 text-bg hover:border-bg hover:bg-bg hover:text-ink'
      : 'border-line text-ink hover:border-accent-dark hover:bg-accent-dark hover:text-bg'

  return (
    <ul aria-label={label} className={`flex flex-wrap items-center gap-3 ${className}`}>
      {ACTIVE_SOCIAL_LINKS.map((s) => (
        <li key={s.id}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            // The glyph carries no text, so the link needs its own accessible
            // name. "(opens in a new tab)" warns screen-reader users before
            // they lose their place — target="_blank" gives no such cue.
            aria-label={`${s.label} (opens in a new tab)`}
            className={`grid h-10 w-10 place-items-center rounded-full border bg-transparent transition-colors duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${ring}`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              {GLYPHS[s.id]}
              {s.id === 'tiktok' && TIKTOK_FLAG}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  )
}
