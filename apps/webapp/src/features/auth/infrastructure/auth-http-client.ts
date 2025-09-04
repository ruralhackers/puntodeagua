import { type GretchResponse, gretch } from 'gretchen'

/**
 * HTTP client wrapper that automatically adds authentication headers
 * and handles auth-related errors.
 */
export class AuthHttpClient {
  static readonly ID = 'AuthHttpClient'

  constructor(
    private readonly baseUrl: string,
    private readonly getToken: () => string | null,
    private readonly onUnauthorized: () => void
  ) {}

  /**
   * Gets the authorization headers with the current token
   */
  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /**
   * Handles response errors, especially 401 Unauthorized
   */
  private handleError(response: any): void {
    if (response.status === 401) {
      this.onUnauthorized()
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<GretchResponse<T>> {
    const url = this.buildUrl(endpoint)
    const response = await gretch<T>(url, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers
      },
      ...options
    }).json()

    this.handleError(response)
    return response
  }

  async post<T, Data>(
    endpoint: string,
    data?: Data,
    options?: RequestInit
  ): Promise<GretchResponse<T>> {
    const url = this.buildUrl(endpoint)
    const response = await gretch<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options?.headers
      },
      ...(data !== undefined && { body: JSON.stringify(data) }),
      ...options
    }).json()

    this.handleError(response)
    return response
  }

  async put<T, Body>(
    endpoint: string,
    data?: Body,
    options?: RequestInit
  ): Promise<GretchResponse<T>> {
    const url = this.buildUrl(endpoint)
    const response = await gretch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options?.headers
      },
      ...(data !== undefined && { body: JSON.stringify(data) }),
      ...options
    }).json()

    this.handleError(response)
    return response
  }

  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<GretchResponse<T>> {
    const url = this.buildUrl(endpoint)
    const response = await gretch(url, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers
      },
      ...options
    }).json()

    this.handleError(response)
    return response
  }

  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl
    return `${cleanBaseUrl}/${cleanEndpoint}`
  }
}
