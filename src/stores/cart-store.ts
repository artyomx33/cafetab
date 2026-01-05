import { create } from 'zustand'

export interface CartItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

interface CartStore {
  items: CartItem[]
  groupId: string | null
  setGroup: (groupId: string) => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
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
  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.productId === item.productId
      )
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return {
        items: [...state.items, { ...item, quantity: 1 }],
      }
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((i) => i.productId !== productId),
        }
      }
      return {
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      }
    }),
  clearCart: () =>
    set({
      items: [],
      groupId: null,
    }),
  getTotal: () => {
    const { items } = get()
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  },
  getItemCount: () => {
    const { items } = get()
    return items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))
