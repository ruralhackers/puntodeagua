import type { HttpClient, Id } from 'core'
import { Maintenance, type MaintenanceRepository } from 'features'

export class MaintenanceApiRestRepository implements MaintenanceRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(): Promise<Maintenance[]> {
    const res = await this.httpClient.get<ReturnType<Maintenance['toDto']>[]>('maintenances')
    if (!res.data) return []
    return res.data.map(Maintenance.fromDto)
  }

  async findById(id: Id): Promise<Maintenance | undefined> {
    try {
      const res = await this.httpClient.get<ReturnType<Maintenance['toDto']>>(
        `maintenances/${id.toString()}`
      )
      return res.data ? Maintenance.fromDto(res.data) : undefined
    } catch (_) {
      return undefined
    }
  }

  async save(entity: Maintenance): Promise<void> {
    await this.httpClient.post<void, ReturnType<Maintenance['toDto']>>(
      `maintenances/${entity.id.toString()}`,
      entity.toDto()
    )
  }

  async delete(id: Id): Promise<void> {
    await this.httpClient.delete(`maintenances/${id.toString()}`)
  }
}
