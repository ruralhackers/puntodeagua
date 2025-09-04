import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { GetWaterPointsQry } from '../../features/water-point/application/get-water-points.qry'
import { WaterPointPage } from '../../features/water-point/delivery/water-point.page'

const Page: NextPage = async () => {
  const waterPoints = await getUseCase(GetWaterPointsQry).execute(GetWaterPointsQry)

  return <WaterPointPage waterPoints={waterPoints} />
}
export default Page
