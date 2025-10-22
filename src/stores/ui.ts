import { create } from 'zustand'

type UiState = {
  isLightboxOpen: boolean
  activeId: string | null
  openLightbox: (id: string) => void
  closeLightbox: () => void
}

export const useUiStore = create<UiState>(set => ({
  isLightboxOpen: false,
  activeId: null,
  openLightbox: (id: string) => set({ isLightboxOpen: true, activeId: id }),
  closeLightbox: () => set({ isLightboxOpen: false, activeId: null })
}))


