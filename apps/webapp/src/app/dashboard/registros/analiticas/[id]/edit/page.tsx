import { UseCaseService } from 'core'
import { webAppContainer } from '../../../../../../core/di/webapp.container'
import { GetAnalysisQry } from '../../../../../../features/analysis/application/get-analysis.qry'
import { EditAnalysisPage } from '../../../../../../features/analysis/delivery/edit-analysis.page'
import { GetWaterZonesQry } from '../../../../../../features/water-zone/application/get-water-zones.qry'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const analysis = await webAppContainer
    .get<UseCaseService>(UseCaseService.ID)
    .execute(GetAnalysisQry, id)

  const waterZones = await webAppContainer
    .get<UseCaseService>(UseCaseService.ID)
    .execute(GetWaterZonesQry)

  if (!analysis) {
    return <div>Analysis not found</div>
  }

  const waterZone = waterZones.find((wz) => wz.id.equals(analysis.waterZoneId))
  if (!waterZone) {
    return <div>Water zone not found</div>
  }

  return <EditAnalysisPage analysis={analysis.toDto()} waterZone={waterZone?.toDto()} />
}
export default Page
