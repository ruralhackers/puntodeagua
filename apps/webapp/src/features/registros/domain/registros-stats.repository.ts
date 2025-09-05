import type { RegistrosStats } from '../application/get-registros-stats.qry'

export interface RegistrosStatsRepository {
  getStats(): Promise<RegistrosStats>
}