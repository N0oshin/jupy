// Tiny server-side endpoint for jupyter-labs.
//
// jupyter-labs is a static Vite SPA (not Next.js) — it has no server of its
// own, and sendOrderConfirmationEmail() must run server-side (it holds the
// Resend API key / SMTP password). This process is that server: it exposes
// one endpoint that the frontend calls right after the shared backend
// confirms an order, and it forwards the request to the shared-email module.
//
// The backend (user-order-service) is unchanged and still creates the
// order; it just returns the order response. This service only sends the
// per-brand confirmation email for jupyter-labs.

import express from 'express';
// Path depth depends on where this file lives relative to /var/www/. On the
// VPS, sites are deployed flat as /var/www/<site>/, sibling to
// /var/www/shared-email/, so this needs exactly 2 levels up
// (server/ -> jupyter-labs/ -> /var/www/) before descending into shared-email/.
import { sendOrderConfirmationEmail } from '../../shared-email/order-email.js';

const PORT = Number(process.env.PORT) || 4001;
const BRAND_DOMAIN = process.env.BRAND_DOMAIN || 'jupyterlabs.net';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://jupyterlabs.net,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();
app.use(express.json({ limit: '100kb' }));

// Minimal CORS: only the frontend's own origins may call this from a
// browser. In production this endpoint is typically proxied same-origin
// through nginx, so this mainly matters for local dev (Vite on :5173).
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.post('/api/send-order-confirmation', async (req, res) => {
  const { customer, order } = req.body || {};
  console.log('[jupyter-labs-email-server] request received', {
    to: customer?.email,
    orderNumber: order?.orderNumber,
  });

  if (!customer?.email || !customer?.name) {
    console.warn('[jupyter-labs-email-server] rejected: missing customer.name/email');
    return res.status(400).json({ success: false, error: '"customer.name" and "customer.email" are required.' });
  }
  if (!order?.orderNumber || !Array.isArray(order?.items)) {
    console.warn('[jupyter-labs-email-server] rejected: missing order.orderNumber/items');
    return res.status(400).json({ success: false, error: '"order.orderNumber" and "order.items" are required.' });
  }

  // Domain is fixed to this frontend's own brand rather than taken from the
  // request — otherwise a caller could pass an arbitrary domain and send
  // mail under a different brand's letterhead through this endpoint.
  const result = await sendOrderConfirmationEmail({ domain: BRAND_DOMAIN, customer, order });
  console.log('[jupyter-labs-email-server] result', result);

  res.status(result.success ? 200 : 502).json(result);
});

/* ─────────────────────────── contact form ─────────────────────────── */

// Where contact submissions are delivered. Set CONTACT_TO in the server env.
const CONTACT_TO = process.env.CONTACT_TO || `support@${BRAND_DOMAIN}`;

// Naive fixed-window rate limit, keyed by client IP. This endpoint is
// unauthenticated and sends mail, so it needs *some* abuse ceiling; 5 messages
// per hour is far above what a real visitor needs. In-memory on purpose — this
// is a single small process, and a restart clearing the counters is acceptable.
const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 };
const contactHits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const entry = contactHits.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT.windowMs) {
    contactHits.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT.max;
}

// Prevent the map from growing without bound on a long-lived process.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of contactHits) {
    if (now - entry.start > RATE_LIMIT.windowMs) contactHits.delete(ip);
  }
}, RATE_LIMIT.windowMs).unref();

/**
 * Resolves the contact-mail sender from the shared-email package.
 *
 * The shared module is deployed alongside this app on the VPS, not vendored
 * here, so whether it exports a contact sender is a deploy-time fact. Resolving
 * it lazily means this endpoint reports a precise, actionable error instead of
 * crashing the whole process at import time on a box where it isn't present.
 */
let contactSenderPromise;
function getContactSender() {
  if (!contactSenderPromise) {
    contactSenderPromise = import('../../shared-email/contact-email.js')
      .then((m) => m.sendContactEmail || null)
      .catch(() => null);
  }
  return contactSenderPromise;
}

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message, phone, website } = req.body || {};

  // Honeypot: a real browser leaves this empty because it is display:none.
  // Answer 200 so the bot sees success and doesn't retry with a variation.
  if (typeof website === 'string' && website.trim() !== '') {
    console.warn('[jupyter-labs-email-server] contact: honeypot tripped, dropping silently');
    return res.status(200).json({ success: true });
  }

  const clean = (v) => (typeof v === 'string' ? v.trim() : '');
  const fields = {
    name: clean(name),
    email: clean(email),
    subject: clean(subject),
    message: clean(message),
    phone: clean(phone),
  };

  // Server-side validation. The client validates too, but that is a UX
  // affordance — anything can POST here, so this is the check that counts.
  if (!fields.name || !fields.email || !fields.subject || !fields.message) {
    return res
      .status(400)
      .json({ success: false, error: 'Name, email, subject and message are all required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }
  if (fields.message.length > 5000 || fields.subject.length > 200 || fields.name.length > 100) {
    return res.status(400).json({ success: false, error: 'One or more fields is too long.' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  if (rateLimited(ip)) {
    console.warn('[jupyter-labs-email-server] contact: rate limited', { ip });
    return res
      .status(429)
      .json({ success: false, error: 'Too many messages sent from this connection. Please try again later.' });
  }

  const sendContactEmail = await getContactSender();
  if (!sendContactEmail) {
    // Fail loudly rather than swallowing the message and telling the visitor it
    // was sent — a contact form that silently discards mail is worse than one
    // that is visibly unavailable.
    console.error(
      '[jupyter-labs-email-server] contact: no sender available — ' +
        'expected ../../shared-email/contact-email.js to export sendContactEmail()',
    );
    return res.status(503).json({
      success: false,
      error: `Our message service is temporarily unavailable. Please email us directly at ${CONTACT_TO}.`,
    });
  }

  console.log('[jupyter-labs-email-server] contact: request received', {
    from: fields.email,
    subject: fields.subject,
  });

  // Domain is fixed to this brand for the same reason as the order email: a
  // caller must not be able to send mail under another brand's letterhead.
  const result = await sendContactEmail({
    domain: BRAND_DOMAIN,
    to: CONTACT_TO,
    from: { name: fields.name, email: fields.email, phone: fields.phone || null },
    subject: fields.subject,
    message: fields.message,
  });

  console.log('[jupyter-labs-email-server] contact: result', result);

  if (result?.success) return res.status(200).json({ success: true });
  return res.status(502).json({
    success: false,
    error: `We couldn't deliver your message just now. Please try again, or email us at ${CONTACT_TO}.`,
  });
});

app.listen(PORT, () => {
  console.log(`[jupyter-labs-email-server] listening on :${PORT} (brand domain: ${BRAND_DOMAIN})`);
});
