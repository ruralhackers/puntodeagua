import { UseCaseService } from 'core'
import { WaterZone } from 'features/entities/water-zone'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { GetMaintenanceQry } from '@/src/features/maintenance/application/get-maintenance.qry'
import { EditMaintenancePage } from '@/src/features/maintenance/delivery/edit-maintenance.page'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)

  const maintenance = await useCaseService.execute(GetMaintenanceQry, id)
  const waterZones = await useCaseService.execute(GetWaterZonesQry)

  if (!maintenance) {
    return <div>Maintenance not found</div>
  }

  const waterZone = waterZones.find((wz: WaterZone) => wz.id.equals(maintenance.waterZoneId))
  if (!waterZone) {
    return <div>Water zone not found</div>
  }

  return (
    <EditMaintenancePage
      maintenance={maintenance.toDto()}
      waterZones={waterZones.map((wz: WaterZone) => wz.toDto())}
    />
  )
}

export default Page
