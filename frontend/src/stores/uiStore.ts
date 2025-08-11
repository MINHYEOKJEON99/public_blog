import { create } from 'zustand'

interface UIState {
  // Sidebar
  sidebarOpen: boolean
  
  // Modals
  modals: {
    loginModal: boolean
    postModal: boolean
    deleteModal: boolean
    confirmModal: boolean
  }
  
  // Loading states
  globalLoading: boolean
  pageLoading: boolean
  
  // Toast/Notifications
  toasts: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
  }>
  
  // Search
  searchOpen: boolean
  searchQuery: string
  
  // Mobile
  mobileMenuOpen: boolean
}

interface UIActions {
  // Sidebar
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  
  // Modals
  openModal: (modal: keyof UIState['modals']) => void
  closeModal: (modal: keyof UIState['modals']) => void
  closeAllModals: () => void
  
  // Loading
  setGlobalLoading: (loading: boolean) => void
  setPageLoading: (loading: boolean) => void
  
  // Toast/Notifications
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  
  // Search
  setSearchOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  clearSearch: () => void
  
  // Mobile
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
}

type UIStore = UIState & UIActions

const initialModals: UIState['modals'] = {
  loginModal: false,
  postModal: false,
  deleteModal: false,
  confirmModal: false,
}

export const useUIStore = create<UIStore>()((set, get) => ({
  // Initial state
  sidebarOpen: false,
  modals: { ...initialModals },
  globalLoading: false,
  pageLoading: false,
  toasts: [],
  searchOpen: false,
  searchQuery: '',
  mobileMenuOpen: false,
  
  // Sidebar actions
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) =>
    set({ sidebarOpen: open }),
  
  // Modal actions
  openModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: true }
    })),
  
  closeModal: (modal) =>
    set((state) => ({
      modals: { ...state.modals, [modal]: false }
    })),
  
  closeAllModals: () =>
    set({ modals: { ...initialModals } }),
  
  // Loading actions
  setGlobalLoading: (loading) =>
    set({ globalLoading: loading }),
  
  setPageLoading: (loading) =>
    set({ pageLoading: loading }),
  
  // Toast actions
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, ...toast }
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))
    
    // Auto remove toast after duration (default 5 seconds)
    const duration = toast.duration || 5000
    setTimeout(() => {
      get().removeToast(id)
    }, duration)
  },
  
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    })),
  
  clearToasts: () =>
    set({ toasts: [] }),
  
  // Search actions
  setSearchOpen: (open) =>
    set({ searchOpen: open }),
  
  setSearchQuery: (query) =>
    set({ searchQuery: query }),
  
  clearSearch: () =>
    set({ searchOpen: false, searchQuery: '' }),
  
  // Mobile actions
  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  
  setMobileMenuOpen: (open) =>
    set({ mobileMenuOpen: open }),
}))