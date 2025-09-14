'use client'

import type { UserDto } from '@pda/users/domain'
import { createContext, useContext, useRef } from 'react'
import { type StoreApi, useStore } from 'zustand'
import { createUserStore, type UserState } from './user-store'

const UserStoreContext = createContext<StoreApi<UserState> | null>(null)

export const UserStoreProvider = ({
  children,
  user
}: {
  children: React.ReactNode
  user: UserDto | null
}) => {
  const storeRef = useRef<StoreApi<UserState> | null>(null)

  storeRef.current ??= createUserStore({ user })

  return <UserStoreContext.Provider value={storeRef.current}>{children}</UserStoreContext.Provider>
}

export const useUserStore = <T,>(selector: (state: UserState) => T): T => {
  const store = useContext(UserStoreContext)
  if (!store) throw new Error('Missing UserStoreProvider')
  return useStore(store, selector)
}
