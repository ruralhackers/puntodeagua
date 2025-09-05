import type { Query } from 'core'
import type { PrismaClient } from 'database'

interface RegistrosStatsResponse {
  contadores: number
  analiticas: number
  incidencias: number
  mantenimientos: number
}

export class GetRegistrosStatsQry implements Query<RegistrosStatsResponse> {
  static readonly ID = 'GetRegistrosStatsQry'

  constructor(private readonly db: PrismaClient) {}

  async handle(): Promise<RegistrosStatsResponse> {
    const [contadores, analiticas, incidencias, mantenimientos] = await Promise.all([
      this.db.waterMeter.count(),
      this.db.analysis.count(),
      this.db.issue.count(),
      this.db.maintenance.count()
    ])

    return {
      contadores,
      analiticas,
      incidencias,
      mantenimientos
    }
  }
}