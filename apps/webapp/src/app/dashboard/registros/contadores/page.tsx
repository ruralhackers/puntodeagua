import { UseCaseService } from 'core'
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

  console.log({ holders, waterPoints, waterMeters, waterZones })

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
