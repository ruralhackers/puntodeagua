import type { Maintenance } from 'features'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/src/components/shared-data/page-header'
import { Page } from '../../../core/components/page'
import MaintenanceItemCard from './maintenance-item-card'

function getStatus(
  executionDate?: Date,
  scheduledDate?: Date
): {
  label: string
  classes: string
} {
  // Placeholder logic: if executed -> Completado; if scheduled in future -> Programado; otherwise Pendiente
  if (executionDate) {
    return { label: 'Completado', classes: 'bg-green-100 text-green-800' }
  }
  if (scheduledDate && new Date(scheduledDate) > new Date()) {
    return { label: 'Programado', classes: 'bg-yellow-100 text-yellow-800' }
  }
  return { label: 'Pendiente', classes: 'bg-gray-100 text-gray-800' }
}

function getTypePlaceholder(): { label: string; classes: string } {
  // Placeholder until maintenance type exists in the model
  return { label: 'Preventivo', classes: 'bg-blue-100 text-blue-800' }
}

export const MaintenancesPage: FC<{ maintenances: Maintenance[] }> = ({ maintenances }) => {
  return (
    <Page>
      <div className="px-3 py-4 pb-20">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mantenimiento</h1>
              <p className="text-gray-600">Registros de mantenimiento</p>
            </div>
            <Button className="flex items-center gap-2" variant="default">
              <Link
                href="/dashboard/nuevo-registro/mantenimiento"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Añadir
              </Link>
            </Button>
          </div>
        </div>

        {/* Maintenances list */}
        <div className="space-y-4">
          {maintenances.map((m) => {
            const dto = m.toDto()
            const status = getStatus(dto.executionDate, dto.scheduledDate)
            const type = getTypePlaceholder().label

            return <MaintenanceItemCard key={dto.id} dto={dto} status={status} type={type} />
          })}
        </div>
      </div>
    </Page>
  )
}
