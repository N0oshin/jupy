/**
 * Display helpers for the User Order API's quirks: monetary fields arrive as
 * strings and DB booleans as 1/0. We never mutate the raw values internally —
 * these are only for rendering.
 */
import type { DbBool, Money } from '../types/api'

/** 1/0 (or null) → boolean. */
export function toBool(v: DbBool | boolean | null | undefined): boolean {
  return v === 1 || v === true
}

/** String money → number, safely (empty/invalid → 0). */
export function moneyToNumber(v: Money | number | null | undefined): number {
  if (v == null) return 0
  const n = typeof v === 'number' ? v : parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

/** Format a string/number money value for display, e.g. "89.99" → "$89.99". */
export function formatApiMoney(v: Money | number | null | undefined, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(moneyToNumber(v))
}
