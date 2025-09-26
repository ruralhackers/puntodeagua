'use client'

import { createContext, useContext, useEffect, useRef } from 'react'
import { type StoreApi, useStore } from 'zustand'
import { api } from '@/trpc/react'
import { type CommunityZonesState, createCommunityZonesStore } from './community-zones-store'

const CommunityZonesStoreContext = createContext<StoreApi<CommunityZonesState> | null>(null)

export const CommunityZonesStoreProvider = ({
  children,
  communityId
}: {
  children: React.ReactNode
  communityId: string
}) => {
  const storeRef = useRef<StoreApi<CommunityZonesState> | null>(null)

  if (!storeRef.current) {
    storeRef.current = createCommunityZonesStore({
      zones: []
    })
  }

  // Move the hook call to the top level - hooks must be called unconditionally
  const {
    data: zones,
    isLoading,
    error
  } = api.community.getCommunityZones.useQuery({ id: communityId }, { enabled: !!communityId })

  useEffect(() => {
    const store = storeRef.current
    if (!store) return

    // Handle loading state
    store.getState().setIsLoading(isLoading)

    // Handle error state
    if (error) {
      const errorMessage = error.message || 'Failed to load community zones'
      store.getState().setError(errorMessage)
      return
    }

    // Handle successful data
    if (zones && !isLoading) {
      store.getState().setZones(zones)
    }
  }, [zones, isLoading, error])

  return (
    <CommunityZonesStoreContext.Provider value={storeRef.current}>
      {children}
    </CommunityZonesStoreContext.Provider>
  )
}

export const useCommunityZonesStore = <T,>(selector: (state: CommunityZonesState) => T): T => {
  const store = useContext(CommunityZonesStoreContext)
  if (!store) throw new Error('Missing CommunityZonesStoreProvider')
  return useStore(store, selector)
}
