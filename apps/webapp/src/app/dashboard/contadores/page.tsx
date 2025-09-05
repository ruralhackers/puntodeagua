import { UseCaseService } from 'core'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { GetWaterMetersQry } from '@/src/features/water-meter/application/get-water-meters.qry'
import WaterMeterPage from '@/src/features/water-meter/delivery/WaterMeter.page'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

const Page = async () => {
  // Execute use cases - the repositories will handle authentication automatically
  const service = webAppContainer.get<UseCaseService>(UseCaseService.ID)

  const [waterMeters, waterZones] = await Promise.all([
    service.execute(GetWaterMetersQry),
    service.execute(GetWaterZonesQry)
  ])

  return (
    <WaterMeterPage
      waterMeters={waterMeters.map((meter) => meter.toDto())}
      waterZones={waterZones.map((zone) => zone.toDto())}
    />
  )
}

export default Page
