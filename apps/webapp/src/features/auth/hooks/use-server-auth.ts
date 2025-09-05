import { getServerAuth, getServerToken, getServerUser } from '../utils/server-auth'

/**
 * Server-side authentication hook
 * This hook works only in server components and provides auth data from cookies
 */
export async function useServerAuth() {
  const authData = await getServerAuth()

  return {
    user: authData.user,
    token: authData.token,
    isAuthenticated: authData.isAuthenticated,
    isLoading: false // Server-side auth is always "loaded"
  }
}

/**
 * Get server token only
 */
export async function useServerToken() {
  return await getServerToken()
}

/**
 * Get server user only
 */
export async function useServerUser() {
  return await getServerUser()
}
