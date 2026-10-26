import { useContext } from 'react'
import { CartContext } from './cart-context'

export function useCart() {
  const v = useContext(CartContext)
  if (!v) throw new Error('useCart must be used inside CartProvider')
  return v
}
