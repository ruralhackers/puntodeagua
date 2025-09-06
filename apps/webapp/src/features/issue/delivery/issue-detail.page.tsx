'use client'
import type { IssueSchema, WaterZoneDto } from 'features'
import { AlertTriangle, Calendar, Edit3, MapPin, Trash } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
// import { useUseCase } from '../../../core/use-cases/use-use-case' // TODO: Uncomment when DeleteIssueCmd is implemented
import { formatDate, toTitle } from '../../analysis/delivery/analysis.utils'

export const IssueDetailPage: FC<{ issue: IssueSchema; zones?: WaterZoneDto[] }> = ({
  issue,
  zones
}) => {
  const router = useRouter()
  // const deleteIssueCommand = useUseCase(DeleteIssueCmd) // TODO: Implement when available

  const dto = issue
  const zoneById = new Map<string, string>((zones ?? []).map((z) => [z.id, z.name]))

  const zoneName = zoneById.get(dto.waterZoneId) ?? `Zona #${dto.waterZoneId}`

  const now = new Date()
  const diffInMs = now.getTime() - new Date(dto.startAt).getTime()
  const daysSinceIssueOpened = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar esta incidencia?')) {
      // await deleteIssueCommand.execute(dto.id)
      router.push(`/dashboard/registros/incidencias`)
    }
  }

  return (
    <div className="px-3 py-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          aria-label="Volver"
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{toTitle(dto.title)}</h1>
          <p className="text-gray-600">Detalles de la incidencia</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Información Básica */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Información Básica
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                dto.status === 'closed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {dto.status === 'closed' ? 'Resuelta' : 'En Proceso'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Título de la Incidencia</div>
                <p className="text-gray-900 mt-1">{toTitle(dto.title)}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Fecha de Reporte
                </div>
                <p className="text-gray-900 mt-1">{formatDate(new Date(dto.startAt))}</p>
              </div>
              {dto.endAt && (
                <div>
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Fecha de Resolución
                  </div>
                  <p className="text-gray-900 mt-1">{formatDate(new Date(dto.endAt))}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Zona de Agua
                </div>
                <p className="text-gray-900 mt-1">{zoneName}</p>
              </div>
              {!dto.endAt && (
                <div>
                  <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Tiempo Abierta
                  </div>
                  <p className="text-gray-900 mt-1">{daysSinceIssueOpened} días</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Descripción */}
        {dto.description && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{dto.description}</p>
          </div>
        )}

        {/* Solución - TODO: Add solution field to IssueSchema */}
        {/* {dto.solution && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Solución
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{dto.solution}</p>
          </div>
        )} */}

        {/* Acciones */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
          <div className="flex gap-3">
            <Link href={`/dashboard/registros/incidencias/${dto.id}/editar`}>
              <Button className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Editar Incidencia
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={handleDelete}
              disabled
            >
              <Trash className="w-4 h-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
