import { createStore } from 'zustand/vanilla'

import type { ThemePreset } from '@/types/preferences/theme'

export type PreferencesState = {
  themePreset: ThemePreset
  setThemePreset: (preset: ThemePreset) => void
}

export const createPreferencesStore = (init?: Partial<PreferencesState>) =>
  createStore<PreferencesState>()((set) => ({
    themePreset: init?.themePreset ?? 'default',
    setThemePreset: (preset) => set({ themePreset: preset })
  }))
