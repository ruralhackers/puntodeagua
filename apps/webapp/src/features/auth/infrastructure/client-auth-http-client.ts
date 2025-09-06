import { HttpClient } from 'core'
import type { GretchResponse } from 'gretchen'

const TOKEN_KEY = 'auth_token'

export class ClientAuthHttpClient extends HttpClient {
  private token: string | null = null

  constructor(baseUrl: string) {
    super(baseUrl)
  }

  setToken(token: string | null) {
    this.token = token
  }

  private readCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    const cookies = document.cookie ? document.cookie.split('; ') : []
    for (const c of cookies) {
      const [k, ...rest] = c.split('=')
      if (k === name) return rest.join('=')
    }
    return null
  }

  private getClientToken(): string | null {
    if (this.token) return this.token
    const cookieToken = this.readCookie(TOKEN_KEY)
    if (cookieToken) return cookieToken
    if (typeof window !== 'undefined') {
      try {
        return window.localStorage.getItem(TOKEN_KEY)
      } catch {
        return null
      }
    }
    return null
  }

  private buildAuthHeaders(existing?: HeadersInit): HeadersInit {
    const token = this.getClientToken()
    return token
      ? {
          Authorization: `Bearer ${token}`,
          ...(existing || {})
        }
      : { ...(existing || {}) }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<GretchResponse<T>> {
    return super.get<T>(endpoint, {
      ...options,
      headers: this.buildAuthHeaders(options?.headers)
    })
  }

  async post<T, Data>(
    endpoint: string,
    data?: Data,
    options?: RequestInit
  ): Promise<GretchResponse<T>> {
    const post = await super.post<T, Data>(endpoint, data, {
      ...options,
      headers: this.buildAuthHeaders(options?.headers)
    })

    return post
  }

  async put<T, Body>(
    endpoint: string,
    data?: Body,
    options?: RequestInit
  ): Promise<GretchResponse<T>> {
    return super.put<T, Body>(endpoint, data, {
      ...options,
      headers: this.buildAuthHeaders(options?.headers)
    })
  }

  async delete<T = unknown>(endpoint: string, options?: RequestInit): Promise<GretchResponse<T>> {
    return super.delete<T>(endpoint, {
      ...options,
      headers: this.buildAuthHeaders(options?.headers)
    })
  }
}
