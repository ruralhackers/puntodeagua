import { createStore } from 'zustand/vanilla'

export type User = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export type UserState = {
  user: User | null
  setUser: (user: User | null) => void
}

export const createUserStore = (init?: Partial<UserState>) =>
  createStore<UserState>()((set) => ({
    user: init?.user ?? null,
    setUser: (user) => set({ user })
  }))
