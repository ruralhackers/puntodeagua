import { UseCaseService } from 'core'
import type { NextPage } from 'next'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'
import { webAppContainer } from '../../../../core/di/webapp.container'
import { GetAnalysesQry } from '../../../../features/analysis/application/get-analyses.qry'
import { AnalysesPage } from '../../../../features/analysis/delivery/analyses.page'

const Page: NextPage = async () => {
  const analysis = await webAppContainer
    .get<UseCaseService>(UseCaseService.ID)
    .execute(GetAnalysesQry)

  const zones = await webAppContainer
    .get<UseCaseService>(UseCaseService.ID)
    .execute(GetWaterZonesQry)

  return <AnalysesPage analysis={analysis} zones={zones} />
}
export default Page
