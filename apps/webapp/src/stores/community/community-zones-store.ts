import type { CommunityZoneDto } from '@pda/community/domain'
import { createStore } from 'zustand/vanilla'

export type CommunityZonesState = {
  isLoading: boolean
  zones: CommunityZoneDto[] | []
  error: string | null
  setZones: (zones: CommunityZoneDto[] | []) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const createCommunityZonesStore = (init?: Partial<CommunityZonesState>) =>
  createStore<CommunityZonesState>()((set) => ({
    isLoading: false,
    zones: init?.zones ?? [],
    error: null,
    setZones: (zones) => set({ zones }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error })
  }))
