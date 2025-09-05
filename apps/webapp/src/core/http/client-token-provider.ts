import type { TokenProvider } from 'core'

/**
 * Client-side token provider for React components
 */
export class ClientTokenProvider implements TokenProvider {
  constructor(
    private readonly getToken: () => string | null,
    private readonly onUnauthorized?: () => void
  ) {}

  getToken(): string | null {
    return this.getToken()
  }

  onUnauthorized(): void {
    if (this.onUnauthorized) {
      this.onUnauthorized()
    }
  }
}
