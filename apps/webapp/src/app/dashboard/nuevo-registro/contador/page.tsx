import type { Holder } from 'features/entities/holder'
import type { WaterMeter } from 'features/entities/water-meter'
import type { WaterZone } from 'features/entities/water-zone'
import type { NextPage } from 'next'
import { getUseCase } from '@/src/core/use-cases/get-use-case'
import { GetHoldersQry } from '@/src/features/holder/application/get-holders.qry'
import { GetWaterMetersQry } from '@/src/features/water-meter/application/get-water-meters.qry'
import WaterMeterForReadingsPage from '@/src/features/water-meter/delivery/WaterMeterForReadings.page'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

const Page: NextPage = async () => {
  const getWaterMetersQry = getUseCase(GetWaterMetersQry)
  const getWaterZonesQry = getUseCase(GetWaterZonesQry)
  const getHoldersQry = getUseCase(GetHoldersQry)

  const [waterMeters, waterZones, holders] = await Promise.all([
    getWaterMetersQry.execute(),
    getWaterZonesQry.execute(),
    getHoldersQry.execute()
  ])

  return (
    <WaterMeterForReadingsPage
      waterMeters={waterMeters.map((meter: WaterMeter) => meter.toDto())}
      waterZones={waterZones.map((zone: WaterZone) => zone.toDto())}
      holders={holders.map((holder: Holder) => holder.toDto())}
    />
  )
}

export default Page
