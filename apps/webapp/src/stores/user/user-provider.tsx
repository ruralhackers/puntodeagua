'use client'

import type { UserClientDto } from '@pda/user/domain'
import { createContext, useContext, useEffect, useRef } from 'react'
import { type StoreApi, useStore } from 'zustand'
import { createUserStore, type UserState } from './user-store'

const UserStoreContext = createContext<StoreApi<UserState> | null>(null)

export const UserStoreProvider = ({
  children,
  user
}: {
  children: React.ReactNode
  user: UserClientDto | null
}) => {
  const storeRef = useRef<StoreApi<UserState> | null>(null)

  if (!storeRef.current) {
    storeRef.current = createUserStore({ user })
  }

  // Sincronizar el store cuando cambie el prop user
  useEffect(() => {
    if (storeRef.current) {
      storeRef.current.getState().setUser(user)
    }
  }, [user])

  return <UserStoreContext.Provider value={storeRef.current}>{children}</UserStoreContext.Provider>
}

export const useUserStore = <T,>(selector: (state: UserState) => T): T => {
  const store = useContext(UserStoreContext)
  if (!store) throw new Error('Missing UserStoreProvider')
  return useStore(store, selector)
}
