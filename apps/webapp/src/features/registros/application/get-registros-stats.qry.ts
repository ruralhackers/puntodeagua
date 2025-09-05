import type { Query } from 'core'
import type { RegistrosStatsRepository } from '../domain/registros-stats.repository'

export interface RegistrosStats {
  contadores: number
  analiticas: number
  incidencias: number
  mantenimientos: number
}

export class GetRegistrosStatsQry implements Query<RegistrosStats> {
  static readonly ID = 'GetRegistrosStatsQry'

  constructor(private readonly repository: RegistrosStatsRepository) {}

  async handle(): Promise<RegistrosStats> {
    return this.repository.getStats()
  }
}