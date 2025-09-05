import type { Id } from 'core'
import type { WaterMeter, WaterMeterRepository } from 'features'
import type { AuthHttpClient } from '../../auth/infrastructure/auth-http-client'

export class WaterMeterAuthApiRestRepository implements WaterMeterRepository {
  constructor(private readonly authHttpClient: AuthHttpClient) {}

  async findById(id: Id, _communityId?: string): Promise<WaterMeter | undefined> {
    const response = await this.authHttpClient.get<WaterMeter>(`water-meter/${id.toString()}`)
    if (!response.data) {
      return undefined
    }
    return response.data
  }

  async findAll(): Promise<WaterMeter[]> {
    const response = await this.authHttpClient.get<WaterMeter[]>('water-meter')
    if (!response.data) {
      return []
    }
    return response.data
  }

  // Implementar otros métodos requeridos por la interfaz
  async save(_input: WaterMeter): Promise<void> {
    throw new Error('Save method not implemented in auth repository')
  }

  async delete(_id: Id): Promise<void> {
    throw new Error('Delete method not implemented in auth repository')
  }

  async findWithFilters(_filters: unknown): Promise<WaterMeter[]> {
    throw new Error('FindWithFilters method not implemented in auth repository')
  }
}
