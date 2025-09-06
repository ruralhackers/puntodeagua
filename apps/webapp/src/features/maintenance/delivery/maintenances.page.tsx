import type { Maintenance } from 'features'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Link as UILink } from '@/components/ui/link'
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
  // sort by scheduledDate descending
  maintenances.sort(
    (a, b) =>
      new Date(b.toDto().scheduledDate).getTime() - new Date(a.toDto().scheduledDate).getTime()
  )

  return (
    <Page>
      <div className="px-3 py-4">
        <div className="mb-6">
          <div className="mb-4">
            <UILink
              to="/dashboard/registros"
              type="invisible"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <span className="p-2 hover:bg-gray-100 rounded-lg">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </span>
              <span className="text-sm">Volver</span>
            </UILink>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mantenimientos</h1>
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
        <div className="flex flex-col gap-3">
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
