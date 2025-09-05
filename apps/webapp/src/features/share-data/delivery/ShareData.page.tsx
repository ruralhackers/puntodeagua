import type { AnalysisDto, IssueDto } from 'features'
import AnalysisItemCard from '../../analysis/delivery/AnalysisItemCard'
import IssueItemCard from '../../issue/delivery/IssueItemCard'
import MaintenanceItemCard from '../../maintenance/delivery/MaintenanceItemCard'

interface SummaryData {
  analyses: any[]
  issues: any[]
  maintenance: any[]
}

interface ShareDataPageProps {
  summaryData: SummaryData
}

export default function ShareDataPage({ summaryData }: ShareDataPageProps) {
  const { analyses, issues, maintenance } = summaryData
  console.log(summaryData)
  return (
    <div>
      <p>Resumen de analíticas, incidencias y mantenimiento</p>
      <p>Ordenado por fecha, de más reciente a más antigua</p>
      <div>
        {/* marcar aquellos que necesiten un documento */}
        <div>
          <p>Analítica</p>
          {/* {iterar por cada una} */}
          {/* <AnalysisItemCard variant="detailed" /> */}
        </div>
        <div>
          <p>Mantenimiento</p>
          {/* <MaintenanceItemCard variant="simple" /> */}
        </div>
        <div>
          <p>Incidencias</p>
          {issues.map((issue) => (
            <IssueItemCard key={issue.id} variant="simple" />
          ))}
        </div>
      </div>
    </div>
  )
}
