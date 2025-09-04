import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { CreateIssuePage } from '@/src/features/issue/delivery/create-issue.page'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

const Page: NextPage = async () => {
  const getWaterZonesQry = getUseCase(GetWaterZonesQry)

  const waterZones = await getWaterZonesQry.execute()

  return <CreateIssuePage waterZones={waterZones.map((x) => x.toDto())} />
}

export default Page
