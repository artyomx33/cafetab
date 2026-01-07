import { create } from 'zustand'
import type { SelectedModifier, Product } from '@/types'

export interface CartItemModifier {
  modifierId: string
  modifierName: string
  quantity: number
  priceAdjustment: number
}

export interface CartItem {
  id: string // Unique ID for each cart item (to distinguish same product with different modifiers)
  productId: string
  productName: string
  quantity: number
  unitPrice: number // Base price without modifiers
  modifiers: CartItemModifier[]
  notes: string
  totalPrice: number // Calculated: (unitPrice + modifier prices) * quantity
}

interface CartStore {
  items: CartItem[]
  groupId: string | null
  setGroup: (groupId: string) => void
  addItemWithModifiers: (item: {
    product: Product
    quantity: number
    selectedModifiers: SelectedModifier[]
    notes: string
    totalPrice: number
  }) => void
  addItem: (item: { productId: string; productName: string; unitPrice: number }) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  groupId: null,
  setGroup: (groupId) =>
    set({
      groupId,
    }),
  addItemWithModifiers: (item) =>
    set((state) => {
      const newItem: CartItem = {
        id: `${item.product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        modifiers: item.selectedModifiers.map((sm) => ({
          modifierId: sm.modifier.id,
          modifierName: sm.modifier.name,
          quantity: sm.quantity,
          priceAdjustment: sm.modifier.price_adjustment,
        })),
        notes: item.notes,
        totalPrice: item.totalPrice,
      }
      return {
        items: [...state.items, newItem],
      }
    }),
  addItem: (item) =>
    set((state) => {
      // Legacy add without modifiers - create a unique item each time
      const newItem: CartItem = {
        id: `${item.productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: item.productId,
        productName: item.productName,
        quantity: 1,
        unitPrice: item.unitPrice,
        modifiers: [],
        notes: '',
        totalPrice: item.unitPrice,
      }
      return {
        items: [...state.items, newItem],
      }
    }),
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    })),
  updateQuantity: (itemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((i) => i.id !== itemId),
        }
      }
      return {
        items: state.items.map((i) => {
          if (i.id === itemId) {
            const modifierTotal = i.modifiers.reduce(
              (sum, m) => sum + m.priceAdjustment * m.quantity,
              0
            )
            return {
              ...i,
              quantity,
              totalPrice: (i.unitPrice + modifierTotal) * quantity,
            }
          }
          return i
        }),
      }
    }),
  clearCart: () =>
    set({
      items: [],
      groupId: null,
    }),
  getTotal: () => {
    const { items } = get()
    return items.reduce((sum, item) => sum + item.totalPrice, 0)
  },
  getItemCount: () => {
    const { items } = get()
    return items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))
