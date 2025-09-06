import { IssueItemCard } from '@/src/features/issue/delivery/issue-item-card'
import AnalysisItemCard from '../../analysis/delivery/AnalysisItemCard'
import MaintenanceItemCard from '../../maintenance/delivery/maintenance-item-card'
import type { SummaryResponse } from '../../summary/infrastructure/summary.api-rest-repository'

interface ShareDataPageProps {
  summaryData: SummaryResponse
}

export default function ShareDataPage({ summaryData }: ShareDataPageProps) {
  const { analyses, issues, maintenance, waterZones } = summaryData

  const zoneById = new Map<string, string>(
    (waterZones ?? []).map((z) => [z.toDto().id, z.toDto().name])
  )
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight mb-1">
        Resumen de analíticas, incidencias y mantenimiento
      </h1>
      <p className="text-sm text-muted-foreground">
        Ordenado por fecha, de más reciente a más antigua
      </p>
      <div>
        {/* marcar aquellos que necesiten un documento */}
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold mb-2 mt-2">Analíticas</h2>
          {analyses.map((item) => (
            <AnalysisItemCard key={item.id} variant="detailed" dto={item} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold mb-2 mt-2">Mantenimiento</h2>
          {maintenance.map((item) => (
            <MaintenanceItemCard key={item.id} variant="simple" dto={item} />
          ))}
        </div>
        <h2 className="text-lg font-semibold mb-2 mt-2">Incidencias</h2>
        <div className="flex flex-col gap-2">
          {issues.map((item) => (
            <IssueItemCard
              key={item.id}
              variant="simple"
              dto={item}
              waterZoneName={zoneById.get(item.waterZoneId) ?? ''}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
