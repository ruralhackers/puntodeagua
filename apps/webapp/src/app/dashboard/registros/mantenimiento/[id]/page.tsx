import { UseCaseService } from 'core'
import type { WaterZone } from 'features/entities/water-zone'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { GetMaintenanceQry } from '@/src/features/maintenance/application/get-maintenance.qry'
import { MaintenanceDetailPage } from '@/src/features/maintenance/delivery/maintenance.page'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)

  const maintenance = await useCaseService.execute(GetMaintenanceQry, id)
  const waterZones = await useCaseService.execute(GetWaterZonesQry)

  if (!maintenance) {
    return (
      <div className="px-3 py-4 pb-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold text-red-800 mb-2">Mantenimiento no encontrado</h1>
          <p className="text-red-600">El mantenimiento solicitado no existe o ha sido eliminado.</p>
        </div>
      </div>
    )
  }

  const waterZone = waterZones.find((wz: WaterZone) => wz.id.equals(maintenance.waterZoneId))
  if (!waterZone) {
    return (
      <div className="px-3 py-4 pb-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold text-red-800 mb-2">Zona de agua no encontrada</h1>
          <p className="text-red-600">La zona de agua asociada a este mantenimiento no existe.</p>
        </div>
      </div>
    )
  }

  return <MaintenanceDetailPage maintenance={maintenance.toDto()} waterZone={waterZone.toDto()} />
}

export default Page
