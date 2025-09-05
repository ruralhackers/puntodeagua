import { Holder } from 'features/entities/holder'
import { WaterMeter } from 'features/entities/water-meter'
import { WaterPoint } from 'features/entities/water-point'
import { WaterZone } from 'features/entities/water-zone'
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
      waterMeters={waterMeters.map((meter: WaterMeter) => meter.toDto())}
      waterZones={waterZones.map((zone: WaterZone) => zone.toDto())}
      holders={holders.map((holder: Holder) => holder.toDto())}
      waterPoints={waterPoints.map((point: WaterPoint) => point.toDto())}
    />
  )
}

export default Page
