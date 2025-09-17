import type { UserClientDto } from '@pda/user/domain'
import { createStore } from 'zustand/vanilla'

export type UserState = {
  user: UserClientDto | null
  setUser: (user: UserClientDto | null) => void
}

export const createUserStore = (init?: Partial<UserState>) =>
  createStore<UserState>()((set) => ({
    user: init?.user ?? null,
    setUser: (user) => set({ user })
  }))
