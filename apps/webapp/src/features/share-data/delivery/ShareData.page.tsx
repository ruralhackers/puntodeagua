import { IssueItemCard } from '@/src/features/issue/delivery/issue-item-card'
import AnalysisItemCard from '../../analysis/delivery/AnalysisItemCard'
import MaintenanceItemCard from '../../maintenance/delivery/MaintenanceItemCard'
import type { SummaryResponse } from '../../summary/infrastructure/summary.api-rest-repository'

interface ShareDataPageProps {
  summaryData: SummaryResponse
}

export default function ShareDataPage({ summaryData }: ShareDataPageProps) {
  const { analyses, issues, maintenance } = summaryData
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
        <div className="space-y-3">
          <h2 className="text-lg font-semibold mb-2">Analíticas</h2>
          {analyses.map((item) => (
            <AnalysisItemCard key={item.id} variant="detailed" dto={item} />
          ))}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Mantenimiento</h2>
          {maintenance.map((item) => (
            <MaintenanceItemCard key={item.id} variant="simple" dto={item} />
          ))}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Incidencias</h2>
          {issues.map((item) => (
            <IssueItemCard key={item.id} variant="simple" />
          ))}
        </div>
      </div>
    </div>
  )
}
