import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { GetWaterMeterQry } from '@/src/features/water-meter/application/get-water-meter.qry'
import WaterMeterDetailPage from '@/src/features/water-meter/delivery/WaterMeterDetail.page'

const Page: NextPage = async ({ params }) => {
  const { id } = params
  const waterMeter = await getUseCase(GetWaterMeterQry).execute(id)
  return <WaterMeterDetailPage waterMeter={waterMeter} />
}

export default Page
