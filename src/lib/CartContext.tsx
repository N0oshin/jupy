import { useEffect, useMemo, useReducer } from 'react'
import { PRODUCTS } from './content'
import { CartContext, type CartCtx, type CartItem } from './cart-context'

type Product = (typeof PRODUCTS)[number]
export type { CartItem } from './cart-context'

type State = { items: CartItem[] }
type Action =
  | { type: 'add'; id: Product['id']; qty?: number }
  | { type: 'remove'; id: Product['id'] }
  | { type: 'setQty'; id: Product['id']; qty: number }
  | { type: 'clear' }
  | { type: 'hydrate'; items: CartItem[] }

const STORAGE_KEY = 'jupyterlabs.cart.v1'

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const qty = action.qty ?? 1
      const existing = state.items.find((i) => i.id === action.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.id ? { ...i, qty: i.qty + qty } : i,
          ),
        }
      }
      return { items: [...state.items, { id: action.id, qty }] }
    }
    case 'remove':
      return { items: state.items.filter((i) => i.id !== action.id) }
    case 'setQty':
      if (action.qty <= 0) {
        return { items: state.items.filter((i) => i.id !== action.id) }
      }
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: action.qty } : i,
        ),
      }
    case 'clear':
      return { items: [] }
    case 'hydrate':
      return { items: action.items }
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as CartItem[]
      const valid = parsed.filter((i) => PRODUCTS.some((p) => p.id === i.id))
      if (valid.length) dispatch({ type: 'hydrate', items: valid })
    } catch {
      // Storage unavailable or corrupt — start with an empty cart.
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // Storage unavailable (private mode / quota) — the cart just won't persist.
    }
  }, [state.items])

  const value = useMemo<CartCtx>(() => {
    const count = state.items.reduce((s, i) => s + i.qty, 0)
    const subtotal = state.items.reduce((s, i) => {
      const p = PRODUCTS.find((p) => p.id === i.id)
      return s + (p ? p.price * i.qty : 0)
    }, 0)
    return {
      items: state.items,
      count,
      subtotal,
      add: (id, qty) => dispatch({ type: 'add', id, qty }),
      remove: (id) => dispatch({ type: 'remove', id }),
      setQty: (id, qty) => dispatch({ type: 'setQty', id, qty }),
      clear: () => dispatch({ type: 'clear' }),
    }
  }, [state.items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
