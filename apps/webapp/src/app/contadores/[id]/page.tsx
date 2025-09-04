import { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { GetWaterMeterQry } from '@/src/features/water-meter/application/get-water-meter.qry'
import WaterMeterDetailPage from '@/src/features/water-meter/delivery/WaterMeterDetail.page'

const Page: NextPage = async () => {
  const id = 'cmf5ayozc000hux1ib48e5480'
  const waterMeter = await getUseCase(GetWaterMeterQry).execute(id)
  console.log('page:', waterMeter)
  return <WaterMeterDetailPage waterMeter={waterMeter} />
}

export default Page
