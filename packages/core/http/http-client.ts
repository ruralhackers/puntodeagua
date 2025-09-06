import { type GretchResponse, gretch } from 'gretchen'

/**
 * HTTP client wrapper that uses Gretchen underneath.
 * Provides simple methods for common HTTP operations with a configurable base URL.
 */
export class HttpClient {
  static readonly ID = 'HttpClient'

  constructor(private readonly baseUrl: string) {}

  /**
   * Performs a GET request to the specified endpoint.
   * @param endpoint - The API endpoint (relative to base URL)
   * @param options - Optional request options
   * @returns Promise with the response data
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<GretchResponse<T>> {
    const url = this.buildUrl(endpoint)
    const response = await gretch<T>(url, {
      method: 'GET',
      ...options
    }).json()

    return response
  }

  /**
   * Performs a POST request to the specified endpoint.
   * @param endpoint - The API endpoint (relative to base URL)
   * @param data - The data to send in the request body
   * @param options - Optional request options
   * @returns Promise with the response data
   */
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
        ...options?.headers
      },
      ...(data !== undefined && { body: JSON.stringify(data) }),
      ...options
    }).json()

    // TODO - revisar si es necesario esto aqui, si no, eliminar
    if (response.error) {
      throw new Error(response.error.message)
    }

    return response
  }

  /**
   * Performs a PUT request to the specified endpoint.
   * @param endpoint - The API endpoint (relative to base URL)
   * @param data - The data to send in the request body
   * @param options - Optional request options
   * @returns Promise with the response data
   */
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
        ...options?.headers
      },
      ...(data !== undefined && { body: JSON.stringify(data) }),
      ...options
    }).json()

    return response
  }

  /**
   * Performs a DELETE request to the specified endpoint.
   * @param endpoint - The API endpoint (relative to base URL)
   * @param options - Optional request options
   * @returns Promise with the response data
   */
  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<GretchResponse<T>> {
    const url = this.buildUrl(endpoint)
    const response = await gretch(url, {
      method: 'DELETE',
      ...options
    }).json()

    return response
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
