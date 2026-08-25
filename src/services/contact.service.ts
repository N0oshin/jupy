/**
 * Contact form submission.
 *
 * Mirrors email.service.ts: jupyter-labs is a static Vite SPA with no API
 * routes of its own, so the form posts to the companion Express server in
 * /server, which owns the mail transport and its credentials. No key or secret
 * is referenced here — this module only ever sees the visitor's own input.
 *
 * The path is relative in every environment:
 *   - production: same-origin, nginx proxies /api/contact to the companion server
 *   - dev: Vite's server.proxy forwards it to :4001 (see vite.config.ts)
 *
 * If this 404s locally the companion server isn't running: cd server && npm start
 */
const CONTACT_ENDPOINT = '/api/contact'

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
  /** Optional — sent only when the visitor filled it in. */
  phone?: string
  /** Honeypot. Real users leave this empty; bots that fill it are dropped. */
  website?: string
}

export interface ContactResult {
  ok: boolean
  error: string | null
}

/**
 * Never throws — the caller renders the outcome as inline UI, so a rejected
 * promise would only turn a recoverable error into an unhandled one.
 */
export async function submitContactForm(payload: ContactPayload): Promise<ContactResult> {
  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name.trim(),
        email: payload.email.trim(),
        subject: payload.subject.trim(),
        message: payload.message.trim(),
        phone: payload.phone?.trim() || undefined,
        website: payload.website ?? '',
      }),
    })

    if (!res.ok) {
      // The server sends a human-readable `error` for the cases a visitor can
      // act on (validation, rate limit, transport not configured).
      const body = await res.json().catch(() => null)
      const serverMessage = body && typeof body.error === 'string' ? body.error : null
      return {
        ok: false,
        error:
          serverMessage ||
          (res.status === 429
            ? 'Too many messages sent. Please try again a little later.'
            : res.status >= 500 || res.status === 404
              ? // 404 = endpoint not wired up; 5xx = companion server down or
                // the proxy could not reach it. Both are our problem, not the
                // visitor's, so they get one plain message rather than a status
                // code they can do nothing with.
                "We couldn't send your message just now — our message service isn't responding. Please try again shortly."
              : 'Something went wrong sending your message. Please check your details and try again.'),
      }
    }

    return { ok: true, error: null }
  } catch (err) {
    console.error('[contact.service] submission failed', err)
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network error — please check your connection and try again.',
    }
  }
}

export const contactService = { submitContactForm }
