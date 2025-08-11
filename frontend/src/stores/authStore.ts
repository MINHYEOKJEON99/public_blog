import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  username: string
  name?: string
  bio?: string
  avatar?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setToken: (token: string) => void
  setLoading: (isLoading: boolean) => void
  clearAuth: () => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, _get) => ({
      ...initialState,
      
      login: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),
      
      logout: () =>
        set({
          ...initialState,
        }),
      
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      
      setToken: (token) =>
        set({ token }),
      
      setLoading: (isLoading) =>
        set({ isLoading }),
      
      clearAuth: () =>
        set({ ...initialState }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)