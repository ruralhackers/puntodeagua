'use client'

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import type { AuthResponseDto } from '../schemas/auth.schema'
import { hybridAuth } from '../utils/hybrid-storage'

interface User {
  id: string
  email: string
  name?: string | null
  roles: ('SUPER_ADMIN' | 'MANAGER' | 'COMMUNITY_ADMIN')[]
  communityId?: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (authResponse: AuthResponseDto) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  useEffect(() => {
    // Check for stored auth data on app start using hybrid storage
    const storedToken = hybridAuth.getToken()
    const storedUser = hybridAuth.getUser()

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }

    setIsLoading(false)
  }, [])

  const login = (authResponse: AuthResponseDto) => {
    const { token: newToken, user: userData } = authResponse

    // Store using hybrid storage (localStorage + cookies)
    hybridAuth.setToken(newToken)
    hybridAuth.setUser(userData)

    // Update state
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    // Clear using hybrid storage (localStorage + cookies)
    hybridAuth.clear()

    // Clear state
    setToken(null)
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
