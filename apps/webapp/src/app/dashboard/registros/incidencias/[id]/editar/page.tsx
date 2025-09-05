import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { EditIssuePage } from '@/src/features/issue/delivery/edit-issue.page'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

interface PageProps {
  params: Promise<{ id: string }>
}

const Page: NextPage<PageProps> = async ({ params }) => {
  const { id } = await params

  const getWaterZonesQry = getUseCase(GetWaterZonesQry)

  const waterZones = await getWaterZonesQry.execute()

  return <EditIssuePage id={id} waterZones={waterZones.map((x) => x.toDto())} />
}

export default Page
