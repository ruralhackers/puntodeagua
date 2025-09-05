import { UseCaseService } from 'core'
import { Holder } from 'features/entities/holder'
import { WaterMeter } from 'features/entities/water-meter'
import { WaterPoint } from 'features/entities/water-point'
import { WaterZone } from 'features/entities/water-zone'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { GetHoldersQry } from '@/src/features/holder/application/get-holders.qry'
import { GetWaterMetersQry } from '@/src/features/water-meter/application/get-water-meters.qry'
import WaterMeterPage from '@/src/features/water-meter/delivery/WaterMeter.page'
import { GetWaterPointsQry } from '@/src/features/water-point/application/get-water-points.qry'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

const Page = async () => {
  // Execute use cases - the repositories will handle authentication automatically
  const service = webAppContainer.get<UseCaseService>(UseCaseService.ID)

  const [waterMeters, waterZones, holders, waterPoints] = await Promise.all([
    service.execute(GetWaterMetersQry),
    service.execute(GetWaterZonesQry),
    service.execute(GetHoldersQry),
    service.execute(GetWaterPointsQry)
  ])

  return (
    <WaterMeterPage
      waterMeters={waterMeters.map((meter: WaterMeter) => meter.toDto())}
      waterZones={waterZones.map((zone: WaterZone) => zone.toDto())}
      holders={holders.map((holder: Holder) => holder.toDto())}
      waterPoints={waterPoints.map((point: WaterPoint) => point.toDto())}
      cardTo="detail"
    />
  )
}

export default Page
