'use client'

import { createContext, useContext, useRef } from 'react'

import { type StoreApi, useStore } from 'zustand'

import { createPreferencesStore, type PreferencesState } from './preferences-store'

const PreferencesStoreContext = createContext<StoreApi<PreferencesState> | null>(null)

export const PreferencesStoreProvider = ({
  children,
  themePreset
}: {
  children: React.ReactNode
  themePreset: PreferencesState['themePreset']
}) => {
  const storeRef = useRef<StoreApi<PreferencesState> | null>(null)

  storeRef.current ??= createPreferencesStore({ themePreset })

  return (
    <PreferencesStoreContext.Provider value={storeRef.current}>
      {children}
    </PreferencesStoreContext.Provider>
  )
}

export const usePreferencesStore = <T,>(selector: (state: PreferencesState) => T): T => {
  const store = useContext(PreferencesStoreContext)
  if (!store) throw new Error('Missing PreferencesStoreProvider')
  return useStore(store, selector)
}
