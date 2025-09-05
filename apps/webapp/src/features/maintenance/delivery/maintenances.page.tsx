import type { Maintenance } from 'features'
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Page } from '../../../core/components/page'
import MaintenanceItemCard from './MaintenanceItemCard'

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
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" variant="ghost">
            <Link href="/dashboard/registros">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mantenimiento</h1>
            <p className="text-gray-600">Registros de mantenimiento preventivo y correctivo</p>
          </div>
        </div>

        {/* Maintenances list */}
        <div className="space-y-4">
          {maintenances.map((m) => {
            const dto = m.toDto()
            const status = getStatus(dto.executionDate, dto.scheduledDate)
            const type = getTypePlaceholder()

            return <MaintenanceItemCard key={dto.id} dto={dto} status={status} type={type} />
          })}
        </div>
      </div>
    </Page>
  )
}
