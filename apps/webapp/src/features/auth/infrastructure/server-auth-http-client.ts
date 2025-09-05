import { type GretchResponse, gretch } from 'gretchen'
import { AuthHttpClient } from './auth-http-client'

/**
 * Server-side HTTP client that automatically gets tokens from cookies
 * This version uses next/headers internally to avoid import issues
 */
export class ServerAuthHttpClient extends AuthHttpClient {
  constructor(baseUrl: string) {
    super(
      baseUrl,
      () => {
        // This won't work on server, but we'll handle it in the server methods
        return null
      },
      () => {
        // Server-side error handling
        throw new Error('Unauthorized')
      }
    )
  }

  /**
   * Server-side method that gets token from cookies using next/headers
   */
  private async getServerToken(): Promise<string | null> {
    try {
      // Dynamic import to avoid issues with next/headers
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      return cookieStore.get('auth_token')?.value || null
    } catch {
      return null
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<GretchResponse<T>> {
    const token = await this.getServerToken()
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

    return super.get<T>(endpoint, {
      ...options,
      headers: {
        ...authHeaders,
        ...options?.headers
      }
    })
  }

  async post<T, Data>(
    endpoint: string,
    data?: Data,
    options?: RequestInit
  ): Promise<GretchResponse<T>> {
    const token = await this.getServerToken()
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

    return super.post<T, Data>(endpoint, data, {
      ...options,
      headers: {
        ...authHeaders,
        ...options?.headers
      }
    })
  }

  async put<T, Body>(
    endpoint: string,
    data?: Body,
    options?: RequestInit
  ): Promise<GretchResponse<T>> {
    const token = await this.getServerToken()
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

    return super.put<T, Body>(endpoint, data, {
      ...options,
      headers: {
        ...authHeaders,
        ...options?.headers
      }
    })
  }

  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<GretchResponse<T>> {
    const token = await this.getServerToken()
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

    return super.delete<T>(endpoint, {
      ...options,
      headers: {
        ...authHeaders,
        ...options?.headers
      }
    })
  }
}
