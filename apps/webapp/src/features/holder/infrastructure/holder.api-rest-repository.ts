import type { HttpClient, Id } from 'core'
import { type GetHoldersFiltersDto, Holder, type HolderDto, type HolderRepository } from 'features'

export class HolderApiRestRepository implements HolderRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(): Promise<Holder[]> {
    const response = await this.httpClient.get<HolderDto[]>('holders')
    const data = response.data ?? []
    return data.map(Holder.fromDto)
  }

  async findById(id: Id): Promise<Holder | undefined> {
    try {
      const response = await this.httpClient.get<HolderDto>(`holders/${id.toString()}`)
      return response.data ? Holder.fromDto(response.data) : undefined
    } catch {
      return undefined
    }
  }

  async findWithFilters(filters: GetHoldersFiltersDto): Promise<Holder[]> {
    const queryParams = new URLSearchParams()

    if (filters.communityId) {
      queryParams.append('communityId', filters.communityId)
    }
    if (filters.name) {
      queryParams.append('name', filters.name)
    }
    if (filters.nationalId) {
      queryParams.append('nationalId', filters.nationalId)
    }

    const response = await this.httpClient.get<HolderDto[]>(`holders?${queryParams.toString()}`)
    const data = response.data ?? []
    return data.map(Holder.fromDto)
  }

  async save(holder: Holder): Promise<void> {
    await this.httpClient.post<void, HolderDto>('holders', holder.toDto())
    return
  }

  async delete(id: Id): Promise<void> {
    await this.httpClient.delete(`holders/${id.toString()}`)
  }
}
