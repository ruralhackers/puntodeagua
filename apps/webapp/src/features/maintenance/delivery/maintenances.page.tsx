import type { Maintenance } from 'features'
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Page } from '../../../core/components/page'

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

            return (
              <div
                key={dto.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Type icon placeholder */}
                    <div className="text-orange-600 mt-1">
                      {/* Simple checkmark icon */}
                      <svg
                        aria-hidden="true"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <div className="mb-2">
                        <div className="flex gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${status.classes}`}
                          >
                            {status.label}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${type.classes}`}
                          >
                            {type.label}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{dto.name}</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Punto de agua:</span>
                          <span>—</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Fecha programada:</span>
                          <span>{formatDate(dto.scheduledDate)}</span>
                        </div>
                        {dto.executionDate && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Fecha ejecución:</span>
                            <span>{formatDate(dto.executionDate)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Responsable:</span>
                          <span>{dto.responsible || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Duración:</span>
                          <span>
                            {typeof dto.duration === 'number' ? `${dto.duration} horas` : '—'}
                          </span>
                        </div>
                        {dto.nextMaintenanceDate && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Próximo mantenimiento:</span>
                            <span>{formatDate(dto.nextMaintenanceDate)}</span>
                          </div>
                        )}
                      </div>

                      {dto.description && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Descripción:</span> {dto.description}
                        </div>
                      )}

                      {dto.observations && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Observaciones:</span> {dto.observations}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons (placeholders, no functionality yet) */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                      type="button"
                      disabled
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                      type="button"
                      disabled
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Page>
  )
}
