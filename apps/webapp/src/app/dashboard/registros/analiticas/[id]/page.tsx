import { UseCaseService } from 'core'
import { webAppContainer } from '../../../../../core/di/webapp.container'
import { GetAnalysisQry } from '../../../../../features/analysis/application/get-analysis.qry'
import { AnalysisDetailPage } from '../../../../../features/analysis/delivery/analysis.page'
import { GetWaterZonesQry } from '../../../../../features/water-zone/application/get-water-zones.qry'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) return null

  const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)

  const [analysis, zones] = await Promise.all([
    useCaseService.execute(GetAnalysisQry, id),
    useCaseService.execute(GetWaterZonesQry)
  ])

  if (!analysis) return null

  return (
    <AnalysisDetailPage analysis={analysis.toDto()} zones={zones.map((zone) => zone.toDto())} />
  )
}
