import type { Maintenance } from 'features'
import { Edit3, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '../../analysis/delivery/analysis.utils'

interface MaintenanceItemCardProps {
  dto: Maintenance
  status?: { label: string; classes: string }
  type?: string
  variant?: 'detailed' | 'simple'
}

export default function MaintenanceItemCard({
  dto,
  status,
  type,
  variant = 'detailed'
}: MaintenanceItemCardProps) {
  const showDetails = variant === 'detailed'

  return (
    <div key={dto.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon placeholder */}
          {showDetails && (
            <div className="text-orange-600 mt-1">
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
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{dto.name}</h3>

            {showDetails ? (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.classes}`}>
                    {status.label}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.classes}`}>
                    {type.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
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
                    <span>{typeof dto.duration === 'number' ? `${dto.duration} horas` : '—'}</span>
                  </div>
                  {dto.nextMaintenanceDate && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Próximo mantenimiento:</span>
                      <span>{formatDate(dto.nextMaintenanceDate)}</span>
                    </div>
                  )}
                </div>

                {dto.description && (
                  <div>
                    <span className="font-medium">Descripción:</span> {dto.description}
                  </div>
                )}
                {dto.observations && (
                  <div>
                    <span className="font-medium">Observaciones:</span> {dto.observations}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1 text-sm text-gray-600">
                {dto.executionDate && (
                  <div>
                    <span className="font-medium">Fecha ejecución:</span>{' '}
                    {formatDate(dto.executionDate)}
                  </div>
                )}
                {dto.description && (
                  <div>
                    <span className="font-medium">Descripción:</span> {dto.description}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showDetails && (
          <div className="flex items-center gap-2 ml-4">
            <Link
              href={`/dashboard/registros/mantenimiento/${dto.id}/edit`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <button
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
              type="button"
              disabled
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
