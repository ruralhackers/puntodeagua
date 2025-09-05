import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { GetHoldersQry } from '@/src/features/holder/application/get-holders.qry'
import { GetWaterMetersQry } from '@/src/features/water-meter/application/get-water-meters.qry'
import WaterMeterPage from '@/src/features/water-meter/delivery/WaterMeter.page'
import { GetWaterPointsQry } from '@/src/features/water-point/application/get-water-points.qry'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

const Page: NextPage = async () => {
  const getWaterMetersQry = getUseCase(GetWaterMetersQry)
  const getWaterZonesQry = getUseCase(GetWaterZonesQry)
  const getHoldersQry = getUseCase(GetHoldersQry)
  const getWaterPointsQry = getUseCase(GetWaterPointsQry)

  const [waterMeters, waterZones, holders, waterPoints] = await Promise.all([
    getWaterMetersQry.execute(),
    getWaterZonesQry.execute(),
    getHoldersQry.execute(),
    getWaterPointsQry.execute()
  ])

  return (
    <WaterMeterPage
      waterMeters={waterMeters.map((meter) => meter.toDto())}
      waterZones={waterZones.map((zone) => zone.toDto())}
      holders={holders.map((holder) => holder.toDto())}
      waterPoints={waterPoints.map((point) => point.toDto())}
    />
  )
}

export default Page
