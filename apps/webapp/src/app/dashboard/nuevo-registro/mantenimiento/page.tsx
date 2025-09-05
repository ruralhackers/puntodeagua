import { UseCaseService } from 'core'
import type { NextPage } from 'next'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { CreateMaintenancePage } from '@/src/features/maintenance/delivery/create-maintenance.page'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

const Page: NextPage = async () => {
  const service = webAppContainer.get<UseCaseService>(UseCaseService.ID)
  const waterZones = await service.execute(GetWaterZonesQry)

  return <CreateMaintenancePage waterZones={waterZones.map((zone) => zone.toDto())} />
}

export default Page
