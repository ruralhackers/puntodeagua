import type { UserClientDto } from '@pda/users/domain'
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
