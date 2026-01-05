import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  visibleCategories: string[]
  toggleCategory: (categoryId: string) => void
  showAllCategories: () => void
  hideAllCategories: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      visibleCategories: [],
      toggleCategory: (categoryId) =>
        set((state) => ({
          visibleCategories: state.visibleCategories.includes(categoryId)
            ? state.visibleCategories.filter((id) => id !== categoryId)
            : [...state.visibleCategories, categoryId],
        })),
      showAllCategories: () =>
        set({
          visibleCategories: [],
        }),
      hideAllCategories: () =>
        set({
          visibleCategories: [],
        }),
    }),
    {
      name: 'ui-storage',
    }
  )
)
