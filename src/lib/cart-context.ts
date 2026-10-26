import { createContext } from 'react'
import type { PRODUCTS } from './content'

type Product = (typeof PRODUCTS)[number]
export type CartItem = { id: Product['id']; qty: number }

export type CartCtx = {
  items: CartItem[]
  count: number
  subtotal: number
  add: (id: Product['id'], qty?: number) => void
  remove: (id: Product['id']) => void
  setQty: (id: Product['id'], qty: number) => void
  clear: () => void
}

export const CartContext = createContext<CartCtx | null>(null)
