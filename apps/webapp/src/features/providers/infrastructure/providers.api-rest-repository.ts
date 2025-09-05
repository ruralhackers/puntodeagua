import type { HttpClient, Id } from 'core'
import { Provider, type ProviderRepository } from 'features'
import type { ProviderSchema } from 'features/providers/schemas/provider.schema'

export class ProvidersApiRestRepository implements ProviderRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(): Promise<Provider[]> {
    const response = await this.httpClient.get<ProviderSchema[]>('providers')
    const data = response.data ?? []
    return data.map(Provider.fromDto)
  }

  async findById(id: Id): Promise<Provider | undefined> {
    try {
      const response = await this.httpClient.get<ProviderSchema>(`providers/${id.toString()}`)
      if (!response.data) return undefined
      return Provider.fromDto(response.data)
    } catch {
      return undefined
    }
  }

  async save(provider: Provider): Promise<void> {
    await this.httpClient.post<void, ProviderSchema>(`providers/${provider.id}`, provider.toDto())
  }

  async delete(id: Id): Promise<void> {
    await this.httpClient.delete(`providers/${id.toString()}`)
  }
}
