import { UseCaseService } from 'core'
import type { NextPage } from 'next'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'
import { webAppContainer } from '../../../../core/di/webapp.container'
import { GetAnalysesQry } from '../../../../features/analysis/application/get-analyses.qry'
import { AnalysisPage } from '../../../../features/analysis/delivery/analyses.page'

const Page: NextPage = async () => {
  const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)
  const [analysis, zones] = await Promise.all([
    useCaseService.execute(GetAnalysesQry),
    useCaseService.execute(GetWaterZonesQry)
  ])

  return <AnalysisPage analysis={analysis} zones={zones} />
}
export default Page
