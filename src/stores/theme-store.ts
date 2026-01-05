import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'classic' | 'premium'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'premium', // Default to premium (the sexy one!)
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'classic' ? 'premium' : 'classic' }),
    }),
    {
      name: 'golftab-theme',
    }
  )
)
