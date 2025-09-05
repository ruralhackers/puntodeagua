import Cookies from "js-cookie"

// Cookie names
export const AUTH_TOKEN_COOKIE = "auth_token"
export const AUTH_USER_COOKIE = "auth_user"
export const AUTH_REDIRECT_COOKIE = "auth_redirect"

// Cookie options
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  expires: 7, // 7 days
  path: "/"
}

/**
 * Check if we are running on the server side
 */
export function isServer(): boolean {
  return typeof window === "undefined"
}

/**
 * Get cookie value (works on both server and client)
 */
export function getCookie(name: string): string | undefined {
  if (isServer()) {
    // On server, we need to use the request headers
    // This will be handled by the server-side utilities
    return undefined
  }
  
  return Cookies.get(name)
}

/**
 * Set cookie value (client-side only)
 */
export function setCookie(name: string, value: string, options = COOKIE_OPTIONS): void {
  if (isServer()) {
    // On server, we can not set cookies directly
    // This should be handled by the response headers
    return
  }
  
  Cookies.set(name, value, options)
}

/**
 * Remove cookie (client-side only)
 */
export function removeCookie(name: string): void {
  if (isServer()) {
    return
  }
  
  Cookies.remove(name, { path: "/" })
}

/**
 * Auth token utilities
 */
export const authCookies = {
  getToken: () => getCookie(AUTH_TOKEN_COOKIE),
  setToken: (token: string) => setCookie(AUTH_TOKEN_COOKIE, token),
  removeToken: () => removeCookie(AUTH_TOKEN_COOKIE),
  
  getUser: () => {
    const userStr = getCookie(AUTH_USER_COOKIE)
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },
  setUser: (user: any) => setCookie(AUTH_USER_COOKIE, JSON.stringify(user)),
  removeUser: () => removeCookie(AUTH_USER_COOKIE),
  
  getRedirect: () => getCookie(AUTH_REDIRECT_COOKIE),
  setRedirect: (path: string) => setCookie(AUTH_REDIRECT_COOKIE, path),
  removeRedirect: () => removeCookie(AUTH_REDIRECT_COOKIE),
  
  clear: () => {
    removeCookie(AUTH_TOKEN_COOKIE)
    removeCookie(AUTH_USER_COOKIE)
    removeCookie(AUTH_REDIRECT_COOKIE)
  }
}
