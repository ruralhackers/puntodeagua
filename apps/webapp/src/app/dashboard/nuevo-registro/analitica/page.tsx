import { UseCaseService } from 'core'
import type { NextPage } from 'next'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { CreateAnalysisPage } from '@/src/features/analysis/delivery/create-analysis.page'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

const Page: NextPage = async () => {
  const waterZones = await webAppContainer
    .get<UseCaseService>(UseCaseService.ID)
    .execute(GetWaterZonesQry)
  return <CreateAnalysisPage waterZones={waterZones.map((x) => x.toDto())} />
}

export default Page
