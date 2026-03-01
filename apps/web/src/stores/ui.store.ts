import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  activeModal: string | null
  scrollTarget: string | null
  toggleSidebar: () => void
  openModal: (id: string) => void
  closeModal: () => void
  scrollToCheck: (checkId: string) => void
  clearScrollTarget: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activeModal: null,
  scrollTarget: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  scrollToCheck: (checkId) => set({ scrollTarget: checkId }),
  clearScrollTarget: () => set({ scrollTarget: null }),
}))
