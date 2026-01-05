import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Seller } from '@/types'

interface SellerStore {
  seller: Seller | null
  isLoggedIn: boolean
  stayLoggedIn: boolean
  login: (seller: Seller) => void
  logout: () => void
  setStayLoggedIn: (value: boolean) => void
}

export const useSellerStore = create<SellerStore>()(
  persist(
    (set) => ({
      seller: null,
      isLoggedIn: false,
      stayLoggedIn: false,
      login: (seller) =>
        set({
          seller,
          isLoggedIn: true,
        }),
      logout: () =>
        set({
          seller: null,
          isLoggedIn: false,
          stayLoggedIn: false,
        }),
      setStayLoggedIn: (value) =>
        set({
          stayLoggedIn: value,
        }),
    }),
    {
      name: 'seller-storage',
      partialize: (state) =>
        state.stayLoggedIn
          ? {
              seller: state.seller,
              isLoggedIn: state.isLoggedIn,
              stayLoggedIn: state.stayLoggedIn,
            }
          : { stayLoggedIn: false },
    }
  )
)
