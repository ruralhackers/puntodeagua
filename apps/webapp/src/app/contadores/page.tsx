import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { GetWaterMetersQry } from '@/src/features/water-meter/application/get-water-meters.qry'
import WaterMeterPage from '@/src/features/water-meter/delivery/WaterMeter.page'

const Page: NextPage = async () => {
  const waterMeters = await getUseCase(GetWaterMetersQry).execute(GetWaterMetersQry)
  return <WaterMeterPage waterMeters={waterMeters} />
}

export default Page
