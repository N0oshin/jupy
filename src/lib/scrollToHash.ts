type LenisLike = { scrollTo: (target: HTMLElement, opts?: { offset?: number; duration?: number }) => void }

/** Smooth-scroll to an in-page anchor, through Lenis when it is mounted. */
export function scrollToHash(hash: string) {
  const el = document.querySelector(hash) as HTMLElement | null
  if (!el) return
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis
  if (lenis) lenis.scrollTo(el, { offset: -10, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
