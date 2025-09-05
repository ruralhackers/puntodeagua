import type { HttpClient } from 'core'
import type { RegistrosStats } from '../application/get-registros-stats.qry'
import type { RegistrosStatsRepository } from '../domain/registros-stats.repository'

export class RegistrosStatsApiRestRepository implements RegistrosStatsRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getStats(): Promise<RegistrosStats> {
    const response = await this.httpClient.get<RegistrosStats>('registros/stats')
    return response.data ?? {
      contadores: 0,
      analiticas: 0,
      incidencias: 0,
      mantenimientos: 0
    }
  }
}