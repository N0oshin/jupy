import { useEffect } from 'react'

/**
 * Dependency-free per-route SEO for this Vite + React Router SPA.
 * Sets document.title, description, canonical, Open Graph / Twitter tags, an
 * optional route-scoped JSON-LD block, and a noindex directive for private
 * pages (cart/checkout). Everything is restored on unmount so client-side
 * navigation never leaves stale head tags behind.
 */
/**
 * Origin used to build canonical URLs, og:url and JSON-LD @ids.
 *
 * This MUST be the real production origin: a canonical pointing at the wrong
 * host tells Google the real pages are duplicates of a domain that does not
 * exist, which suppresses them from the index entirely. Set VITE_SITE_URL at
 * build time. The fallback below is the live brand domain (it matches
 * BRAND_DOMAIN / ALLOWED_ORIGINS in server/.env.example), so a build that
 * forgets the env var still emits correct canonicals rather than pointing every
 * page at a domain that does not resolve.
 */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? 'https://jupyterlabs.net'
).replace(/\/$/, '')

interface SeoOptions {
  title: string
  description?: string
  /** Route path used to build the canonical + og:url (e.g. "/products/foo"). */
  path?: string
  image?: string
  /** Schema.org JSON-LD object(s) injected for this route only. */
  jsonLd?: object | object[] | null
  /** Keep private pages out of the index (cart, checkout). */
  noindex?: boolean
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): { el: HTMLMetaElement; created: boolean } {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  let created = false
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
    created = true
  }
  el.setAttribute('content', content)
  return { el, created }
}

export function useSeo({ title, description, path = '/', image, jsonLd, noindex = false }: SeoOptions) {
  const ld = jsonLd ? JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : null

  useEffect(() => {
    const url = SITE_URL + path
    const prevTitle = document.title
    document.title = title

    const restore: Array<() => void> = []

    const apply = (attr: 'name' | 'property', key: string, content: string) => {
      const before = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)?.getAttribute('content') ?? null
      const { el, created } = upsertMeta(attr, key, content)
      restore.push(() => {
        if (created) el.remove()
        else if (before !== null) el.setAttribute('content', before)
      })
    }

    if (description) {
      apply('name', 'description', description)
      apply('property', 'og:description', description)
      apply('name', 'twitter:description', description)
    }
    apply('property', 'og:title', title)
    apply('name', 'twitter:title', title)
    apply('property', 'og:url', url)
    if (image) {
      apply('property', 'og:image', image)
      apply('name', 'twitter:image', image)
    }
    if (noindex) apply('name', 'robots', 'noindex, nofollow')

    // Canonical
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const prevHref = canonical?.href ?? null
    if (canonical) canonical.href = url

    // Route-scoped JSON-LD
    let script: HTMLScriptElement | null = null
    if (ld) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-route-jsonld', '')
      script.text = ld
      document.head.appendChild(script)
    }

    return () => {
      document.title = prevTitle
      restore.forEach((fn) => fn())
      if (canonical && prevHref !== null) canonical.href = prevHref
      script?.remove()
    }
  }, [title, description, path, image, ld, noindex])
}
