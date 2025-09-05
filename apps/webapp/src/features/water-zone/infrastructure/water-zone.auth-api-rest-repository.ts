import type { Id } from 'core'
import type { WaterZone, WaterZoneRepository } from 'features'
import type { AuthHttpClient } from '../../auth/infrastructure/auth-http-client'

export class WaterZoneAuthApiRestRepository implements WaterZoneRepository {
  constructor(private readonly authHttpClient: AuthHttpClient) {}

  async findById(id: Id): Promise<WaterZone | undefined> {
    const response = await this.authHttpClient.get<WaterZone>(`water-zones/${id.toString()}`)
    if (!response.data) {
      return undefined
    }
    return response.data
  }

  async findAll(): Promise<WaterZone[]> {
    const response = await this.authHttpClient.get<WaterZone[]>('water-zones')
    if (!response.data) {
      return []
    }
    return response.data
  }

  async findWithFilters(_filters: unknown): Promise<WaterZone[]> {
    // For now, just return all water zones
    return this.findAll()
  }

  async save(_input: WaterZone): Promise<void> {
    throw new Error('Save method not implemented in auth repository')
  }

  async delete(_id: Id): Promise<void> {
    throw new Error('Delete method not implemented in auth repository')
  }
}
