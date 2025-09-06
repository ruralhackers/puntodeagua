import { UseCaseService } from 'core'
import type { Issue } from 'features/issues/entities/issue'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { DashboardPage } from '@/src/features/dashboard/delivery/dashboard.page'
import { GetOpenIssuesQry } from '@/src/features/issue/application/get-open-issues.qry'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

export default async function Page() {
  const service = webAppContainer.get<UseCaseService>(UseCaseService.ID)
  const openIssues = await service.execute(GetOpenIssuesQry)
  const zones = await service.execute(GetWaterZonesQry)
  const zoneById = new Map<string, string>((zones ?? []).map((z) => [z.toDto().id, z.toDto().name]))

  const incidenciasAbiertas = openIssues?.map((issue: Issue) => ({
    id: issue.id.toString(),
    titulo: issue.title.toString(),
    ubicacion: zoneById.get(issue.waterZoneId.toString()) ?? '',
    fecha: issue.startAt.toDate().toISOString()
  }))

  return <DashboardPage incidenciasAbiertas={incidenciasAbiertas} />
}
