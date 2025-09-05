import { authCookies } from './cookie-storage'

/**
 * Hybrid storage utilities that work with both localStorage and cookies
 * This ensures backward compatibility while enabling SSR support
 */

/**
 * Get token from both localStorage and cookies (client-side)
 */
export function getHybridToken(): string | null {
  if (typeof window === 'undefined') return null

  // Try localStorage first (existing behavior)
  const localToken = localStorage.getItem('auth_token')
  if (localToken) {
    // Sync to cookies for SSR
    authCookies.setToken(localToken)
    return localToken
  }

  // Fallback to cookies
  return authCookies.getToken() || null
}

/**
 * Get user from both localStorage and cookies (client-side)
 */
export function getHybridUser(): any | null {
  if (typeof window === 'undefined') return null

  // Try localStorage first (existing behavior)
  const localUser = localStorage.getItem('auth_user')
  if (localUser) {
    try {
      const user = JSON.parse(localUser)
      // Sync to cookies for SSR
      authCookies.setUser(user)
      return user
    } catch {
      // Invalid localStorage data, try cookies
    }
  }

  // Fallback to cookies
  return authCookies.getUser()
}

/**
 * Set token in both localStorage and cookies (client-side)
 */
export function setHybridToken(token: string): void {
  if (typeof window === 'undefined') return

  // Set in localStorage (existing behavior)
  localStorage.setItem('auth_token', token)

  // Also set in cookies for SSR
  authCookies.setToken(token)
}

/**
 * Set user in both localStorage and cookies (client-side)
 */
export function setHybridUser(user: any): void {
  if (typeof window === 'undefined') return

  // Set in localStorage (existing behavior)
  localStorage.setItem('auth_user', JSON.stringify(user))

  // Also set in cookies for SSR
  authCookies.setUser(user)
}

/**
 * Clear auth data from both localStorage and cookies (client-side)
 */
export function clearHybridAuth(): void {
  if (typeof window === 'undefined') return

  // Clear localStorage (existing behavior)
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  localStorage.removeItem('auth_redirect')

  // Also clear cookies
  authCookies.clear()
}

/**
 * Get redirect path from both localStorage and cookies (client-side)
 */
export function getHybridRedirect(): string | null {
  if (typeof window === 'undefined') return null

  // Try localStorage first (existing behavior)
  const localRedirect = localStorage.getItem('auth_redirect')
  if (localRedirect) {
    // Sync to cookies
    authCookies.setRedirect(localRedirect)
    return localRedirect
  }

  // Fallback to cookies
  return authCookies.getRedirect() || null
}

/**
 * Set redirect path in both localStorage and cookies (client-side)
 */
export function setHybridRedirect(path: string): void {
  if (typeof window === 'undefined') return

  // Set in localStorage (existing behavior)
  localStorage.setItem('auth_redirect', path)

  // Also set in cookies
  authCookies.setRedirect(path)
}

/**
 * Remove redirect path from both localStorage and cookies (client-side)
 */
export function removeHybridRedirect(): void {
  if (typeof window === 'undefined') return

  // Remove from localStorage (existing behavior)
  localStorage.removeItem('auth_redirect')

  // Also remove from cookies
  authCookies.removeRedirect()
}

/**
 * Hybrid auth utilities object
 */
export const hybridAuth = {
  getToken: getHybridToken,
  setToken: setHybridToken,
  getUser: getHybridUser,
  setUser: setHybridUser,
  getRedirect: getHybridRedirect,
  setRedirect: setHybridRedirect,
  removeRedirect: removeHybridRedirect,
  clear: clearHybridAuth
}
