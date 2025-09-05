import { cookies } from 'next/headers'
import { AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE } from './cookie-storage'

/**
 * Server-side authentication utilities
 * These functions work only on the server side
 */

export interface ServerAuthData {
  token: string | null
  user: any | null
  isAuthenticated: boolean
}

/**
 * Get authentication data from cookies on the server
 */
export async function getServerAuth(): Promise<ServerAuthData> {
  try {
    const cookieStore = await cookies()

    const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value || null
    const userStr = cookieStore.get(AUTH_USER_COOKIE)?.value || null

    let user = null
    if (userStr) {
      try {
        user = JSON.parse(userStr)
      } catch {
        // Invalid user data in cookie
        user = null
      }
    }

    return {
      token,
      user,
      isAuthenticated: !!(token && user)
    }
  } catch (error) {
    // If cookies() fails (e.g., not in a server component), return empty auth
    return {
      token: null,
      user: null,
      isAuthenticated: false
    }
  }
}

/**
 * Get just the token from server cookies
 */
export async function getServerToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get(AUTH_TOKEN_COOKIE)?.value || null
  } catch {
    return null
  }
}

/**
 * Get just the user from server cookies
 */
export async function getServerUser(): Promise<any | null> {
  try {
    const cookieStore = await cookies()
    const userStr = cookieStore.get(AUTH_USER_COOKIE)?.value || null

    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  } catch {
    return null
  }
}

/**
 * Check if user has specific role on server
 */
export async function hasServerRole(role: string): Promise<boolean> {
  const user = await getServerUser()
  return user?.roles?.includes(role) || false
}

/**
 * Check if user is admin on server
 */
export async function isServerAdmin(): Promise<boolean> {
  const user = await getServerUser()
  return user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('COMMUNITY_ADMIN') || false
}
