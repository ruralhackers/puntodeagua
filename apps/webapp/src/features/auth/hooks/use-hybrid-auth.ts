'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../context/auth-context'
import { hybridAuth } from '../utils/hybrid-storage'

/**
 * Hybrid authentication hook that works on both server and client
 * On client: uses the AuthContext
 * On server: falls back to hybrid storage
 */
export function useHybridAuth() {
  const clientAuth = useAuth()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // During SSR or before hydration, use hybrid storage
  if (!isHydrated) {
    return {
      user: hybridAuth.getUser(),
      token: hybridAuth.getToken(),
      isAuthenticated: !!(hybridAuth.getToken() && hybridAuth.getUser()),
      isLoading: true
    }
  }

  // After hydration, use the client auth context
  return clientAuth
}

/**
 * Get hybrid token (works on both server and client)
 */
export function useHybridToken(): string | null {
  const { token } = useHybridAuth()
  return token
}

/**
 * Get hybrid user (works on both server and client)
 */
export function useHybridUser() {
  const { user } = useHybridAuth()
  return user
}
