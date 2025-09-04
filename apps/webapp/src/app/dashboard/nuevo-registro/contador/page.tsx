import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { GetWaterMetersQry } from '@/src/features/water-meter/application/get-water-meters.qry'
import WaterMeterPage from '@/src/features/water-meter/delivery/WaterMeter.page'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

const Page: NextPage = async () => {
  const getWaterMetersQry = getUseCase(GetWaterMetersQry)
  const getWaterZonesQry = getUseCase(GetWaterZonesQry)

  const [waterMeters, waterZones] = await Promise.all([
    getWaterMetersQry.execute(),
    getWaterZonesQry.execute()
  ])

  return (
    <WaterMeterPage
      waterMeters={waterMeters.map((meter) => meter.toDto())}
      waterZones={waterZones.map((zone) => zone.toDto())}
    />
  )
}

export default Page
