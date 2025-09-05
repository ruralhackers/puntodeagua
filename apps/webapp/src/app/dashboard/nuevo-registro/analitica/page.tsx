import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { CreateAnalysisPage } from '@/src/features/analysis/delivery/create-analysis.page'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'
import { WaterZone } from 'features/entities/water-zone'

const Page: NextPage = async () => {
  const getWaterZonesQry = getUseCase(GetWaterZonesQry)
  const waterZones = await getWaterZonesQry.execute()
  return <CreateAnalysisPage waterZones={waterZones.map((x: WaterZone) => x.toDto())} />
}
export default Page
