import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  actualTheme: 'light' | 'dark'
}

interface ThemeActions {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setActualTheme: (actualTheme: 'light' | 'dark') => void
}

type ThemeStore = ThemeState & ThemeActions

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof window === 'undefined') return
  
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      actualTheme: getSystemTheme(),
      
      setTheme: (theme) => {
        const actualTheme = theme === 'system' ? getSystemTheme() : theme
        applyTheme(actualTheme)
        set({ theme, actualTheme })
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },
      
      setActualTheme: (actualTheme) => {
        applyTheme(actualTheme)
        set({ actualTheme })
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const actualTheme = state.theme === 'system' ? getSystemTheme() : state.theme
          state.setActualTheme(actualTheme)
          
          if (typeof window !== 'undefined' && state.theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const handleChange = (e: MediaQueryListEvent) => {
              state.setActualTheme(e.matches ? 'dark' : 'light')
            }
            mediaQuery.addEventListener('change', handleChange)
          }
        }
      },
    }
  )
)