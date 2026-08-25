/**
 * Jupyter Labs — centralized social profile configuration.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ACTION REQUIRED BEFORE THESE ICONS APPEAR
 *
 * Paste the real profile URLs below. Every entry left as an empty string is
 * filtered out and its icon is not rendered, so the footer never ships a dead
 * or placeholder link. Set one or more and the icon row appears automatically.
 *
 * These are deliberately NOT pre-filled with guessed handles. The footer
 * currently carries a scam-account warning (see SOCIALS_CONFIGURED below), and
 * pointing users at an unverified profile is exactly the risk that warning
 * exists to prevent.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface SocialLink {
  /** Stable key, also used to pick the icon glyph. */
  id: 'instagram' | 'tiktok' | 'youtube' | 'x'
  /** Accessible name — read by screen readers in place of the glyph. */
  label: string
  /** Full profile URL. Empty string = not configured = not rendered. */
  url: string
}

export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'instagram', label: 'Instagram', url: '' },
  { id: 'tiktok', label: 'TikTok', url: '' },
  { id: 'youtube', label: 'YouTube', url: '' },
  { id: 'x', label: 'X (formerly Twitter)', url: '' },
]

/** Only the profiles that have actually been configured. */
export const ACTIVE_SOCIAL_LINKS = SOCIAL_LINKS.filter((s) => s.url.trim() !== '')

/**
 * True once at least one profile URL is set.
 *
 * The footer's "Jupyter Labs does not operate on any social media platforms"
 * warning is gated on this: the moment a real profile exists that statement is
 * false and must not keep showing, and while no profile exists the warning is
 * the correct thing to display. Keeping both driven by one flag means the two
 * can never contradict each other.
 */
export const SOCIALS_CONFIGURED = ACTIVE_SOCIAL_LINKS.length > 0
