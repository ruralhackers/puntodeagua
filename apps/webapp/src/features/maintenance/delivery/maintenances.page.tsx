import type { Maintenance } from 'features'
import type { FC } from 'react'
import { Page } from '../../../core/components/page'
import MaintenanceItemCard from './MaintenanceItemCard'
import {PageHeader} from "@/src/components/shared-data/page-header";

function formatDate(date?: Date) {
  try {
    if (!date) return '—'
    // Format example: 5 de junio de 2023 (es-ES)
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    })
  } catch {
    return '—'
  }
}

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
        <PageHeader title="Mantenimiento" subtitle="Registros de mantenimiento preventivo y correctivo" />

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
