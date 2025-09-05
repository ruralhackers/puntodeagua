import type { TokenProvider } from 'core'

/**
 * Server-side token provider that gets tokens from Next.js cookies
 */
export class ServerTokenProvider implements TokenProvider {
  async getToken(): Promise<string | null> {
    try {
      // Dynamic import to avoid issues with next/headers
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      return cookieStore.get('auth_token')?.value || null
    } catch {
      return null
    }
  }
}
