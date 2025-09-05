import { gretch } from 'gretchen'

interface RequestParams<T> {
  method: 'PUT' | 'POST' | 'GET' | 'DELETE'
  endpoint: string
  data?: T
  options?: RequestInit
}

export type HttpClientResponse<T> = {
  url: string
  status: number
  data: T
  error: undefined
  response: Response
}

/**
 * Interface for providing authentication tokens
 */
export interface TokenProvider {
  getToken(): string | null | Promise<string | null>
  onUnauthorized?(): void
}

export class HttpClient {
  static readonly ID = 'HttpClient'

  constructor(
    private readonly baseUrl: string,
    private readonly tokenProvider?: TokenProvider
  ) {}

  /**
   * Gets authentication headers if token provider is available
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.tokenProvider) {
      return {}
    }

    const token = await this.tokenProvider.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async request<Result, Body = void>(
    params: RequestParams<Body>
  ): Promise<HttpClientResponse<Result>> {
    const { method, endpoint, data, options } = params
    const url = this.buildUrl(endpoint)

    // Get authentication headers if token provider is available
    const authHeaders = await this.getAuthHeaders()

    const gretchOptions = {
      method,
      ...options,
      headers: {
        ...authHeaders,
        ...options?.headers
      }
    }

    if ((method === 'POST' || method === 'PUT') && data !== undefined) {
      gretchOptions.headers = {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options?.headers
      }
      gretchOptions.body = JSON.stringify(data)
    }

    const response = await gretch<Result>(url, gretchOptions).json()

    // Handle unauthorized responses
    if (response.status === 401 && this.tokenProvider?.onUnauthorized) {
      this.tokenProvider.onUnauthorized()
    }

    if (response.error !== undefined) {
      throw new Error(`HTTP ${method} request failed: ${response.error}`)
    }

    return {
      url: response.url,
      status: response.status,
      // biome-ignore lint/style/noNonNullAssertion: Data should always be expected
      data: response.data!,
      error: undefined,
      response: response.response
    }
  }

  async get<Result>(endpoint: string, options?: RequestInit): Promise<HttpClientResponse<Result>> {
    return this.request<Result>({
      method: 'GET',
      endpoint,
      data: undefined,
      options
    })
  }

  async post<Result, Body>(
    endpoint: string,
    data?: Body,
    options?: RequestInit
  ): Promise<HttpClientResponse<Result>> {
    return this.request<Result, Body>({
      method: 'POST',
      endpoint,
      data,
      options
    })
  }

  async put<Result, Body>(
    endpoint: string,
    data?: Body,
    options?: RequestInit
  ): Promise<HttpClientResponse<Result>> {
    return this.request<Result, Body>({
      method: 'PUT',
      endpoint,
      data,
      options
    })
  }

  async delete<Result = void>(
    endpoint: string,
    options?: RequestInit
  ): Promise<HttpClientResponse<Result>> {
    return this.request<Result>({
      method: 'DELETE',
      endpoint,
      data: undefined,
      options
    })
  }

  /**
   * Builds the full URL by combining base URL with the endpoint.
   * @param endpoint - The API endpoint
   * @returns The full URL
   */
  private buildUrl(endpoint: string): string {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

    // Remove trailing slash from base URL if present
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl

    return `${cleanBaseUrl}/${cleanEndpoint}`
  }
}
